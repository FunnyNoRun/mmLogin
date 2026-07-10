/*
 * funnybot 客户端（仅服务端调用，token 不下发浏览器）。
 * funnybot 只做一件事：校验 QQ 是否在群，在群则把认证链接私聊发给用户。
 */

export interface NotifyResult {
    in_group: boolean
    sent?: boolean
    nickname?: string
}

export async function verifyAndNotify(qq: string, message: string): Promise<NotifyResult> {
    const cfg = useRuntimeConfig()
    return await $fetch<NotifyResult>('/mm/verify-and-notify', {
        baseURL: cfg.funnybotUrl,
        method: 'POST',
        headers: { 'X-MM-Token': cfg.mmToken },
        body: { qq, message },
        timeout: 15000,
    })
}
