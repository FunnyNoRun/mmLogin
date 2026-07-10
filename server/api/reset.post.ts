import { useStore } from '~/server/utils/store'
import { requireSession, destroySession } from '~/server/utils/session'

/*
 * 演示用「清库」：清空全部账号 / 会话 / 认证资料，方便反复演示。
 * 要求已登录才能触发（避免被随手打），清完顺手把当前会话也销毁掉，
 * 前端拿到结果后回到首页即为一次干净的重来。
 */
export default defineEventHandler(async (event) => {
    await requireSession(event)
    await useStore(event).clear()
    await destroySession(event)
    return { ok: true, message: '数据库已清空，所有账号已删除' }
})
