import type { AuthPayload, AuthResult, Profile } from '~/types/auth'
import { useStore } from '~/server/utils/store'
import { verifyPassword } from '~/server/utils/crypto'
import { createSession } from '~/server/utils/session'

/*
 * 登录：校验口令 -> 建立会话。
 * 返回 authed 表示该账号是否已完成新生认证（前端据此进资料页或认证页）。
 */
export default defineEventHandler(async (event): Promise<AuthResult> => {
    const body = await readBody<Partial<AuthPayload>>(event)
    const account = body?.account?.trim()
    const password = body?.password

    if (!account || !password) {
        setResponseStatus(event, 400)
        return { ok: false, message: '账号或密码不能为空' }
    }

    const store = useStore(event)
    const user = await store.get<{ passHash: string }>(`user:${account}`)
    if (!user || !(await verifyPassword(password, user.passHash))) {
        setResponseStatus(event, 401)
        return { ok: false, message: '账号或密码错误' }
    }

    await createSession(event, { account })
    const profile = await store.get<Profile>(`profile:${account}`)

    return { ok: true, message: `欢迎回来，${account}`, authed: !!profile }
})
