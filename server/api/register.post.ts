import type { AuthPayload, AuthResult } from '~/types/auth'
import { useStore } from '~/server/utils/store'
import { hashPassword } from '~/server/utils/crypto'
import { createSession } from '~/server/utils/session'

/*
 * 注册：账号唯一校验 -> 存哈希口令 -> 直接建立会话（自动登录）。
 */
export default defineEventHandler(async (event): Promise<AuthResult> => {
    const body = await readBody<Partial<AuthPayload>>(event)
    const account = body?.account?.trim()
    const password = body?.password

    if (!account || !password) {
        setResponseStatus(event, 400)
        return { ok: false, message: '账号或密码不能为空' }
    }
    if (account.length < 2 || account.length > 32) {
        setResponseStatus(event, 400)
        return { ok: false, message: '账号长度需在 2–32 位之间' }
    }
    if (password.length < 6) {
        setResponseStatus(event, 400)
        return { ok: false, message: '密码至少 6 位' }
    }

    const store = useStore(event)
    const key = `user:${account}`
    if (await store.get(key)) {
        setResponseStatus(event, 409)
        return { ok: false, message: '该账号已被注册' }
    }

    await store.put(key, { passHash: await hashPassword(password) })
    await createSession(event, { account })

    return { ok: true, message: `注册成功，欢迎加入 YulinSec，${account}`, authed: false }
})
