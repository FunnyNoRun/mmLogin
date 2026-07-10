/*
 * 轻量口令哈希 & 随机 id —— 基于 Web Crypto，
 * 在 Cloudflare Workers 与 Node 18+ 下均可用。
 * 存储格式：`{saltHex}:{sha256Hex}`。
 */

function toHex(buf: ArrayBuffer | Uint8Array): string {
    const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
    let s = ''
    for (const b of bytes) s += b.toString(16).padStart(2, '0')
    return s
}

export function randomHex(bytes = 16): string {
    const a = new Uint8Array(bytes)
    crypto.getRandomValues(a)
    return toHex(a)
}

async function digest(salt: string, password: string): Promise<string> {
    const data = new TextEncoder().encode(`${salt}:${password}`)
    const hash = await crypto.subtle.digest('SHA-256', data)
    return toHex(hash)
}

export async function hashPassword(password: string): Promise<string> {
    const salt = randomHex(16)
    return `${salt}:${await digest(salt, password)}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
    const [salt, hash] = stored.split(':')
    if (!salt || !hash) return false
    return (await digest(salt, password)) === hash
}
