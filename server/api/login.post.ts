import type { AuthPayload, AuthResult } from '~/types/auth'

/*
 * 登录接口（预留桩）
 * 目前只做基本校验并回显。接真实后端时在这里：
 *   1. 从 event.context.cloudflare.env 取 D1 / KV 绑定
 *   2. 查用户、校验密码哈希（如 bcrypt / scrypt）
 *   3. 签发 session / JWT
 */
export default defineEventHandler(async (event): Promise<AuthResult> => {
    const body = await readBody<Partial<AuthPayload>>(event)
    const account = body?.account?.trim()
    const password = body?.password

    if (!account || !password) {
        setResponseStatus(event, 400)
        return { ok: false, message: '账号或密码不能为空' }
    }

    // TODO: 替换为真实鉴权
    return {
        ok: true,
        message: `（演示）欢迎回来，${account}`,
        user: { account },
    }
})
