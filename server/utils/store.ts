import type { H3Event } from 'h3'

/*
 * 强一致 KV 存储抽象
 * ────────────────────────────────────────────────────────
 * 生产环境用 Cloudflare D1（一张 mm_store(k,v,exp) 表当强一致 KV 用，
 * 轮询认证状态不会读到过期数据）；本地 `nuxt dev` 没有 D1 绑定时，
 * 自动回退到进程内存实现，开发无需任何额外配置。
 *
 * 存的四类 key：
 *   user:{account}      注册用户 { passHash }
 *   session:{sid}       浏览器会话（Cookie=sid）{ account }
 *   auth:{uuid}         一次认证任务 { account, qq, nickname, status, error }（TTL）
 *   profile:{account}   认证完成后的资料 { kind, nickname, qq, avatar, card }
 */

export interface KV {
    get<T = unknown>(key: string): Promise<T | null>
    put(key: string, value: unknown, ttlSeconds?: number): Promise<void>
    del(key: string): Promise<void>
}

const now = () => Math.floor(Date.now() / 1000)

// ── 内存实现（本地开发 / 无 D1 绑定时）──────────────────────
const memoryMap = new Map<string, { v: string; exp?: number }>()

const memoryKV: KV = {
    async get<T>(key: string) {
        const row = memoryMap.get(key)
        if (!row) return null
        if (row.exp && row.exp < now()) {
            memoryMap.delete(key)
            return null
        }
        return JSON.parse(row.v) as T
    },
    async put(key, value, ttlSeconds) {
        memoryMap.set(key, {
            v: JSON.stringify(value),
            exp: ttlSeconds ? now() + ttlSeconds : undefined,
        })
    },
    async del(key) {
        memoryMap.delete(key)
    },
}

// ── D1 实现 ────────────────────────────────────────────────
const ensured = new WeakSet<object>()

async function ensureTable(db: any) {
    if (ensured.has(db)) return
    await db
        .prepare(
            'CREATE TABLE IF NOT EXISTS mm_store (k TEXT PRIMARY KEY, v TEXT NOT NULL, exp INTEGER)'
        )
        .run()
    ensured.add(db)
}

function d1KV(db: any): KV {
    return {
        async get<T>(key: string) {
            await ensureTable(db)
            const row = await db
                .prepare('SELECT v, exp FROM mm_store WHERE k = ?')
                .bind(key)
                .first()
            if (!row) return null
            if (row.exp && Number(row.exp) < now()) {
                await db.prepare('DELETE FROM mm_store WHERE k = ?').bind(key).run()
                return null
            }
            return JSON.parse(row.v as string) as T
        },
        async put(key, value, ttlSeconds) {
            await ensureTable(db)
            const exp = ttlSeconds ? now() + ttlSeconds : null
            await db
                .prepare('INSERT OR REPLACE INTO mm_store (k, v, exp) VALUES (?, ?, ?)')
                .bind(key, JSON.stringify(value), exp)
                .run()
        },
        async del(key) {
            await ensureTable(db)
            await db.prepare('DELETE FROM mm_store WHERE k = ?').bind(key).run()
        },
    }
}

export function useStore(event: H3Event): KV {
    const db = (event.context as any)?.cloudflare?.env?.DB
    return db ? d1KV(db) : memoryKV
}
