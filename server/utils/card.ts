/*
 * 一卡通二维码解析 + 电子科大卡片信息查询（仅服务端，避开浏览器 CORS）。
 *
 * 二维码内容形如：
 *   https://hq.uestc.edu.cn/vc?c=RGAuoxwMZG...%2FUU%2B8%3D
 * 取出 c 参数并 URL 解码后，作为 id 请求 getcardinfo。
 */

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

const QR_PREFIX = 'https://hq.uestc.edu.cn/vc'
const CARD_API = 'https://hq.uestc.edu.cn/hqapi-v2/card/oa/getcardinfo'

export class CardError extends Error {}

/** 校验二维码 url 格式并取出解码后的 c（失败抛 CardError） */
export function extractCardId(qr: string): string {
    let url: URL
    try {
        url = new URL(qr.trim())
    } catch {
        throw new CardError('非法二维码：无法识别的内容')
    }
    // 校验域名与路径（兼容 http/https 与结尾斜杠）
    const normalized = `${url.protocol}//${url.host}${url.pathname}`.replace(/\/$/, '')
    if (normalized !== QR_PREFIX && normalized !== QR_PREFIX.replace('https', 'http')) {
        throw new CardError('非法二维码：不是一卡通认证码')
    }
    const c = url.searchParams.get('c')
    if (!c) throw new CardError('非法二维码：缺少认证参数')
    // URL 已自动解码 searchParams（%2F -> /, %2B -> +, %3D -> =）
    return c
}

/** 用卡片 id 查询持卡人信息（失败抛 CardError） */
export async function fetchCardInfo(id: string): Promise<CardInfo> {
    let resp: { status?: number; data?: { info?: CardInfo }; msg?: string }
    try {
        resp = await $fetch(CARD_API, {
            method: 'POST',
            body: { id },
            timeout: 15000,
        })
    } catch {
        throw new CardError('查询卡片信息失败，请稍后重试')
    }

    if (!resp || resp.status !== 200 || !resp.data?.info) {
        throw new CardError('查询卡片信息失败：接口未返回有效数据')
    }

    const info = resp.data.info
    const studentNo = info.uestc_id || info.id
    // 必须字段：姓名 / 学号 / 手机号
    if (!info.name || !studentNo || !info.phone) {
        throw new CardError('认证失败：卡片信息缺少必要字段（姓名 / 学号 / 手机号）')
    }
    return info
}

export function qqAvatar(qq: string): string {
    return `https://q1.qlogo.cn/g?b=qq&nk=${encodeURIComponent(qq)}&s=0`
}
