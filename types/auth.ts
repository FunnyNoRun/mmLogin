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
    /** 是否已完成新生认证（用于前端决定进资料页还是认证页） */
    authed?: boolean
}

/** 电子科大一卡通持卡人信息 */
export interface CardInfo {
    type?: string
    id?: string
    name?: string
    sex?: string
    minzu?: string
    depart_id?: string
    depart_name?: string
    major_name?: string
    campus?: string
    phone?: string
    identity_id?: string
    in_school_date?: string
    leave_school_date?: string
    uestc_id?: string
    headpic?: string
    [k: string]: unknown
}

/** 认证完成后的资料 */
export interface Profile {
    kind: 'internal' | 'external'
    account: string
    nickname: string
    /** 校内选手：QQ 号 */
    qq?: string
    /** 校内选手：QQ 头像 url */
    avatar?: string
    /** 校内选手：卡片全字段 */
    card?: CardInfo
}

/** /api/me 返回 */
export interface MeResult {
    loggedIn: boolean
    account?: string
    authed: boolean
    profile?: Profile | null
}

/** 发起校内认证的结果 */
export interface StartResult {
    ok: boolean
    inGroup: boolean
    /** 在群时返回：认证任务 uuid，用于轮询 */
    uuid?: string
    nickname?: string
    message?: string
}

/** 轮询认证任务状态 */
export type AuthStatus = 'pending' | 'done' | 'failed' | 'expired'
export interface PollResult {
    status: AuthStatus
    error?: string
}
