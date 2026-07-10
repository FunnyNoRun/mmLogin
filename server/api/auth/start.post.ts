import type { StartResult } from '~/types/auth'
import { useStore } from '~/server/utils/store'
import { requireSession } from '~/server/utils/session'
import { verifyAndNotify } from '~/server/utils/funnybot'

/*
 * 校内选手发起认证：
 *   1. 生成唯一 uuid，构造 mmLogin 的认证链接 /auth?uuid=xxx
 *   2. 让 funnybot 校验 QQ 是否在群、在群则把链接私聊给用户
 *   3. 在群 -> 建认证任务（TTL 15 分钟），前端轮询 /api/auth/poll
 *      不在群 -> 返回 inGroup=false，前端弹「加群」引导
 */
const AUTH_JOB_TTL = 60 * 15

export default defineEventHandler(async (event): Promise<StartResult> => {
    const session = await requireSession(event)
    const account = session.data.account

    const body = await readBody<{ qq?: string }>(event)
    const qq = String(body?.qq ?? '').trim()
    if (!/^\d{5,12}$/.test(qq)) {
        setResponseStatus(event, 400)
        return { ok: false, inGroup: false, message: '请输入正确的 QQ 号（纯数字）' }
    }

    const uuid = crypto.randomUUID()
    const cfg = useRuntimeConfig()
    const origin = cfg.public.siteUrl || getRequestURL(event).origin
    const authUrl = `${origin}/auth?uuid=${uuid}`

    const message =
        '【YulinSec 招新认证】\n' +
        '你正在进行新生身份认证。请在本设备点开下方链接，' +
        '上传或扫描你的一卡通背面二维码完成认证：\n' +
        `${authUrl}\n` +
        '若非本人操作，请忽略本条消息。'

    let result
    try {
        result = await verifyAndNotify(qq, message)
    } catch (e) {
        setResponseStatus(event, 502)
        return { ok: false, inGroup: false, message: '认证服务暂时不可用，请稍后再试' }
    }

    if (!result.in_group) {
        return { ok: true, inGroup: false }
    }

    await useStore(event).put(
        `auth:${uuid}`,
        {
            account,
            qq,
            nickname: result.nickname || qq,
            status: 'pending',
        },
        AUTH_JOB_TTL
    )

    return { ok: true, inGroup: true, uuid, nickname: result.nickname || qq }
})
