<script setup lang="ts">
import type { AuthPayload, AuthResult, MeResult } from '~/types/auth'

/*
 * 首页两态：
 *   未登录  -> AuthCard（登录 / 注册，卡片内部翻转）
 *   已登录  -> 跳转 /profile（默认展示为校外选手，可在资料页认证为校内选手）
 * 登录态在 SSR 阶段就用 Cookie 拉取，避免刷新时闪现登录框。
 */
const { notify } = useToast()
const requestFetch = useRequestFetch()

const { data: me, refresh: refreshMe } = await useAsyncData<MeResult>('mm-me-index', () =>
    requestFetch('/api/me')
)

const mode = ref<'login' | 'register'>('login')
const busy = ref(false)

const loggedIn = computed(() => !!me.value?.loggedIn)

// 已登录 -> 直接进资料页（含首屏 SSR 与登录后）
watch(
    loggedIn,
    (v) => {
        if (v) navigateTo('/profile', { replace: true })
    },
    { immediate: true }
)

async function onSubmit(payload: AuthPayload) {
    if (!payload.account || !payload.password) {
        notify(false, '请填写账号和密码')
        return
    }
    busy.value = true
    try {
        const res = await $fetch<AuthResult>(mode.value === 'login' ? '/api/login' : '/api/register', {
            method: 'POST',
            body: payload,
        })
        notify(res.ok, res.message, { title: mode.value === 'login' ? '登录' : '注册' })
        if (res.ok) await refreshMe()
    } catch (e: any) {
        notify(false, e?.data?.message || '网络异常，请稍后再试')
    } finally {
        busy.value = false
    }
}
</script>

<template>
    <AuthCard v-model:mode="mode" :busy="busy" @submit="onSubmit" />
</template>
