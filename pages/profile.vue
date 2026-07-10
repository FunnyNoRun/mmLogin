<script setup lang="ts">
import type { MeResult } from '~/types/auth'

/*
 * 认证完成资料页。凭 Cookie 判定：
 *   未登录        -> 回首页
 *   已登录未认证  -> 回首页去认证
 *   已认证        -> 展示资料卡
 */
const { notify } = useToast()
const requestFetch = useRequestFetch()

const { data: me, refresh } = await useAsyncData<MeResult>('mm-me-profile', () =>
    requestFetch('/api/me')
)

watchEffect(() => {
    if (!me.value) return
    if (!me.value.loggedIn || !me.value.authed) navigateTo('/', { replace: true })
})

async function onLogout() {
    await $fetch('/api/logout', { method: 'POST' })
    notify(true, '已退出登录')
    await navigateTo('/', { replace: true })
}
</script>

<template>
    <ProfileCard v-if="me?.profile" :profile="me.profile" @logout="onLogout" />
</template>
