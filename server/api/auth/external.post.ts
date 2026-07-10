import type { Profile } from '~/types/auth'
import { useStore } from '~/server/utils/store'
import { requireSession } from '~/server/utils/session'

/*
 * 校外选手：无需 QQ、无需扫码，直接写入一份 external 资料并完成认证。
 */
export default defineEventHandler(async (event) => {
    const session = await requireSession(event)
    const account = session.data.account

    const profile: Profile = {
        kind: 'external',
        account,
        nickname: account,
    }
    await useStore(event).put(`profile:${account}`, profile)

    return { ok: true, profile }
})
