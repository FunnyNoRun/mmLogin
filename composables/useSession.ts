import type { MeResult } from '~/types/auth'

/*
 * 客户端登录态。me 为 null 表示尚未拉取。
 */
export function useSession() {
    const me = useState<MeResult | null>('mm-session', () => null)

    async function refresh() {
        me.value = await $fetch<MeResult>('/api/me')
        return me.value
    }

    async function logout() {
        await $fetch('/api/logout', { method: 'POST' })
        me.value = { loggedIn: false, authed: false }
    }

    return { me, refresh, logout }
}
