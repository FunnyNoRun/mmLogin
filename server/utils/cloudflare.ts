import type { H3Event } from 'h3'

/*
 * 预留：读取 Cloudflare 运行时绑定（D1 / KV / 环境变量）。
 * 在 wrangler.toml 里配置绑定后，服务端可这样取：
 *   const { DB } = useCloudflareEnv(event)
 *
 * 类型按需在这里补全（部署后可用 `wrangler types` 生成）。
 */
export interface CloudflareEnv {
    // DB?: D1Database
    // SESSIONS?: KVNamespace
    JWT_SECRET?: string
    APP_ENV?: string
}

export function useCloudflareEnv(event: H3Event): CloudflareEnv {
    // Nitro 的 cloudflare preset 会把运行时 env 挂在 context 上
    const cf = (event.context as { cloudflare?: { env?: CloudflareEnv } }).cloudflare
    return cf?.env ?? {}
}
