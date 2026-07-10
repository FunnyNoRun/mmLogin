import type { H3Event } from 'h3'
import { getCookie, setCookie, deleteCookie } from 'h3'
import { useStore } from './store'
import { randomHex } from './crypto'

/*
 * 基于 Cookie 的浏览器会话。
 * Cookie 只保存一个不透明的 sid，真正的会话数据存在 KV 里（session:{sid}）。
 * 这样即便用户断开 WS/轮询，只要 Cookie 还在，下次打开就能凭 sid 找回身份，
 * 再根据 profile:{account} 是否存在决定直接进资料页还是要求认证。
 */

const COOKIE = 'mm_sid'
const MAX_AGE = 60 * 60 * 24 * 30 // 30 天

export interface SessionData {
    /** 关联的登录账号 */
    account: string
}

export interface Session {
    sid: string
    data: SessionData
}

function sessionKey(sid: string) {
    return `session:${sid}`
}

/** 读取当前会话（无则返回 null） */
export async function getSession(event: H3Event): Promise<Session | null> {
    const sid = getCookie(event, COOKIE)
    if (!sid) return null
    const data = await useStore(event).get<SessionData>(sessionKey(sid))
    if (!data) return null
    return { sid, data }
}

/** 创建会话并写下 Cookie（登录 / 注册成功时调用） */
export async function createSession(event: H3Event, data: SessionData): Promise<Session> {
    const sid = randomHex(24)
    await useStore(event).put(sessionKey(sid), data, MAX_AGE)
    setCookie(event, COOKIE, sid, {
        httpOnly: true,
        sameSite: 'lax',
        secure: !import.meta.dev,
        path: '/',
        maxAge: MAX_AGE,
    })
    return { sid, data }
}

/** 销毁会话并清除 Cookie */
export async function destroySession(event: H3Event): Promise<void> {
    const sid = getCookie(event, COOKIE)
    if (sid) await useStore(event).del(sessionKey(sid))
    deleteCookie(event, COOKIE, { path: '/' })
}

/** 要求已登录，否则抛 401 */
export async function requireSession(event: H3Event): Promise<Session> {
    const s = await getSession(event)
    if (!s) throw createError({ statusCode: 401, statusMessage: '未登录' })
    return s
}
