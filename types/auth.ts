/* 前后端共享的认证类型 */

export interface AuthPayload {
    /** 账号 */
    account: string
    /** 密码 */
    password: string
}

export interface AuthResult {
    ok: boolean
    message: string
    /** 预留：登录成功后返回的用户信息 / token */
    user?: {
        account: string
    }
    token?: string
}
