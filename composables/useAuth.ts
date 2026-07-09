import type { AuthPayload, AuthResult } from '~/types/auth'

/*
 * 前端认证入口 —— 目前只调用预留的 /api 桩接口。
 * 之后接真实后端时，这里不用改：改 server/api 下的实现即可。
 */
export function useAuth() {
    async function login(payload: AuthPayload) {
        return await $fetch<AuthResult>('/api/login', {
            method: 'POST',
            body: payload,
        })
    }

    async function register(payload: AuthPayload) {
        return await $fetch<AuthResult>('/api/register', {
            method: 'POST',
            body: payload,
        })
    }

    return { login, register }
}
