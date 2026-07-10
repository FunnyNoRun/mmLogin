import type { Profile } from '~/types/auth'
import { useStore } from '~/server/utils/store'
import { extractCardId, fetchCardInfo, qqAvatar, CardError } from '~/server/utils/card'

/*
 * 设备B（/auth 页面）提交扫到的二维码内容完成认证：
 *   校验二维码格式 -> 取 c -> 服务端查卡片信息 -> 写 profile:{account} + 标记任务 done
 * 二维码非法 / 缺字段等「用户可重试」的错误不会把任务打成 failed。
 */
export default defineEventHandler(async (event) => {
    const body = await readBody<{ uuid?: string; qr?: string }>(event)
    const uuid = String(body?.uuid ?? '').trim()
    const qr = String(body?.qr ?? '').trim()

    if (!uuid || !qr) {
        setResponseStatus(event, 400)
        return { ok: false, message: '参数缺失' }
    }

    const store = useStore(event)
    const jobKey = `auth:${uuid}`
    const job = await store.get<{
        account: string
        qq: string
        nickname: string
        status: string
    }>(jobKey)

    if (!job) {
        setResponseStatus(event, 410)
        return { ok: false, message: '认证已过期，请回到原设备重新发起认证' }
    }
    if (job.status === 'done') {
        return { ok: true, message: '该认证已完成', name: job.nickname }
    }

    try {
        const id = extractCardId(qr)
        const info = await fetchCardInfo(id)

        const profile: Profile = {
            kind: 'internal',
            account: job.account,
            nickname: job.nickname,
            qq: job.qq,
            avatar: qqAvatar(job.qq),
            card: info,
        }
        await store.put(`profile:${job.account}`, profile)
        await store.put(jobKey, { ...job, status: 'done' }, 60 * 15)

        return { ok: true, message: '认证成功', name: info.name }
    } catch (e) {
        const msg = e instanceof CardError ? e.message : '认证失败，请重试'
        setResponseStatus(event, 400)
        return { ok: false, message: msg }
    }
})
