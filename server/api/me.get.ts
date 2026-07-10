import type { MeResult, Profile } from '~/types/auth'
import { useStore } from '~/server/utils/store'
import { getSession } from '~/server/utils/session'

/*
 * 当前登录态 + 认证资料。
 * authed 直接由 profile:{account} 是否存在推导 —— 认证一旦完成即持久化，
 * 因此无论是否断过轮询，凭 Cookie 再次打开都会被判定为已认证。
 */
export default defineEventHandler(async (event): Promise<MeResult> => {
    const session = await getSession(event)
    if (!session) return { loggedIn: false, authed: false }

    const account = session.data.account
    const profile = await useStore(event).get<Profile>(`profile:${account}`)

    return { loggedIn: true, account, authed: !!profile, profile: profile ?? null }
})
