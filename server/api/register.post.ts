import type { AuthPayload, AuthResult } from '~/types/auth'

/*
 * 注册接口（预留桩）
 * 接真实后端时在这里：
 *   1. 校验账号是否已存在（D1）
 *   2. 哈希密码后写库
 *   3. 可选：直接签发 session 完成自动登录
 */
export default defineEventHandler(async (event): Promise<AuthResult> => {
    const body = await readBody<Partial<AuthPayload>>(event)
    const account = body?.account?.trim()
    const password = body?.password

    if (!account || !password) {
        setResponseStatus(event, 400)
        return { ok: false, message: '账号或密码不能为空' }
    }
    if (password.length < 6) {
        setResponseStatus(event, 400)
        return { ok: false, message: '密码至少 6 位' }
    }

    // TODO: 写入数据库
    return {
        ok: true,
        message: `（演示）注册成功，${account}`,
        user: { account },
    }
})
