<script setup lang="ts">
import type { MeResult, Profile } from '~/types/auth'

/*
 * 资料页。凭 Cookie 判定：
 *   未登录        -> 回首页
 *   已登录未认证  -> 默认按「校外选手」展示（可点按钮认证为校内选手）
 *   已认证        -> 展示对应资料卡（校内 / 校外）
 */
const { notify } = useToast()
const { openConfirm } = useModal()
const requestFetch = useRequestFetch()

const { data: me, refresh } = await useAsyncData<MeResult>('mm-me-profile', () =>
    requestFetch('/api/me')
)

watchEffect(() => {
    if (!me.value) return
    if (!me.value.loggedIn) navigateTo('/', { replace: true })
})

/*
 * 展示用资料：已有资料直接用；未认证时默认合成一份「校外选手」资料，
 * 这样登录后无需任何操作即可看到 profile，且被标红提示可升级为校内。
 */
const displayProfile = computed<Profile | null>(() => {
    if (!me.value?.loggedIn) return null
    if (me.value.profile) return me.value.profile
    const account = me.value.account ?? ''
    return { kind: 'external', account, nickname: account }
})

// 「认证为校内选手」弹窗
const showUpgrade = ref(false)

async function onUpgraded() {
    showUpgrade.value = false
    await refresh()
}

async function onLogout() {
    await $fetch('/api/logout', { method: 'POST' })
    notify(true, '已退出登录')
    await navigateTo('/', { replace: true })
}

// 演示用清库：确认后清空所有账号，随后自身会话失效，回到首页重新演示
function onReset() {
    openConfirm({
        title: '清除数据库？',
        message: '将删除全部账号、会话与认证资料（仅供演示反复使用），此操作不可撤销。',
        confirmText: '清空数据库',
        danger: true,
        onConfirm: async () => {
            try {
                const res = await $fetch<{ ok: boolean; message: string }>('/api/reset', {
                    method: 'POST',
                })
                notify(res.ok, res.message, { title: '清库' })
            } catch (e: any) {
                notify(false, e?.data?.message || '清库失败，请稍后再试')
            } finally {
                await navigateTo('/', { replace: true })
            }
        },
    })
}
</script>

<template>
    <ProfileCard
        v-if="displayProfile"
        :profile="displayProfile"
        @logout="onLogout"
        @reset="onReset"
        @upgrade="showUpgrade = true"
    />
    <ProfileAuthModal v-if="showUpgrade" @done="onUpgraded" @close="showUpgrade = false" />
</template>
