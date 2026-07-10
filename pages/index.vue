<script setup lang="ts">
import type { AuthPayload, AuthResult, MeResult } from '~/types/auth'

/*
 * 首页三态：
 *   未登录            -> AuthCard（登录 / 注册，卡片内部翻转）
 *   已登录未认证      -> 整卡翻转到 AuthPanel（QQ 认证 / 校外选手）
 *   已认证            -> 跳转 /profile
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
const authed = computed(() => !!me.value?.authed)
const flipped = computed(() => loggedIn.value && !authed.value)

// 已认证 -> 直接进资料页（含首屏 SSR 与登录后）
watch(
    authed,
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

async function onAuthDone() {
    await refreshMe()
    await navigateTo('/profile', { replace: true })
}

async function onLogout() {
    await $fetch('/api/logout', { method: 'POST' })
    await refreshMe()
    mode.value = 'login'
    notify(true, '已退出登录')
}
</script>

<template>
    <div class="post-stage">
        <div class="post-flip" :class="{ flipped }">
            <div class="post-flip__face post-flip__face--front">
                <AuthCard v-model:mode="mode" :busy="busy" @submit="onSubmit" />
            </div>
            <div class="post-flip__face post-flip__face--back" :aria-hidden="!flipped">
                <AuthPanel :account="me?.account" @done="onAuthDone" @logout="onLogout" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.post-stage {
    position: relative;
    z-index: 10;
    width: 340px;
    max-width: calc(100vw - 40px);
    perspective: 1800px;
}
.post-flip {
    position: relative;
    width: 100%;
    transform-style: preserve-3d;
    transition: transform 0.85s cubic-bezier(0.68, -0.35, 0.27, 1.35);
    will-change: transform;
}
.post-flip.flipped {
    transform: rotateY(180deg);
}
.post-flip__face {
    width: 100%;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
}
.post-flip__face--front {
    position: relative;
}
.post-flip__face--back {
    position: absolute;
    top: 0;
    left: 0;
    transform: rotateY(180deg);
}

/* AuthCard 自带 .card-stage 定宽，这里让它撑满 face */
.post-flip__face :deep(.card-stage) {
    width: 100%;
    max-width: none;
}

@media (prefers-reduced-motion: reduce) {
    .post-flip {
        transition: none;
    }
}
</style>
