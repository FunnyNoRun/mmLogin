import type { PollResult } from '~/types/auth'
import { useStore } from '~/server/utils/store'

/*
 * 设备A 轮询认证任务状态。任务过期（TTL 到期被清）时返回 expired。
 */
export default defineEventHandler(async (event): Promise<PollResult> => {
    const uuid = String(getQuery(event).uuid ?? '')
    if (!uuid) return { status: 'expired' }

    const job = await useStore(event).get<{ status: PollResult['status']; error?: string }>(
        `auth:${uuid}`
    )
    if (!job) return { status: 'expired' }

    return { status: job.status, error: job.error }
})
