<script setup lang="ts">
import type { AuthPayload } from '~/types/auth'

const mode = defineModel<'login' | 'register'>('mode', { default: 'login' })
defineProps<{ busy?: boolean }>()
const emit = defineEmits<{ submit: [payload: AuthPayload] }>()

const isRegister = computed(() => mode.value === 'register')

// public/ 下的静态资源，运行时从站点根路径提供
const logoUrl = '/yulinsec.jpg'

function go(target: 'login' | 'register') {
    mode.value = target
}
</script>

<template>
    <div class="card-stage">
        <div class="auth-card" :class="{ flipped: isRegister }">
            <!-- 正面：登录 -->
            <section class="card-face card-face--front">
                <header class="card-head">
                    <span class="card-logo"><img :src="logoUrl" alt="YulinSec" /></span>
                    <h1>欢迎回来</h1>
                    <p>登录以继续 YulinSec</p>
                </header>

                <div class="seg" :data-active="mode">
                    <span class="seg-thumb" />
                    <button type="button" :class="{ on: !isRegister }" @click="go('login')">登录</button>
                    <button type="button" :class="{ on: isRegister }" @click="go('register')">注册</button>
                </div>

                <LoginForm :busy="busy" @submit="emit('submit', $event)" />
            </section>

            <!-- 背面：注册 -->
            <section class="card-face card-face--back">
                <header class="card-head">
                    <span class="card-logo"><img :src="logoUrl" alt="YulinSec" /></span>
                    <h1>创建账号</h1>
                    <p>注册一个新的 YulinSec 账号</p>
                </header>

                <div class="seg" :data-active="mode">
                    <span class="seg-thumb" />
                    <button type="button" :class="{ on: !isRegister }" @click="go('login')">登录</button>
                    <button type="button" :class="{ on: isRegister }" @click="go('register')">注册</button>
                </div>

                <RegisterForm :busy="busy" @submit="emit('submit', $event)" />
            </section>
        </div>
    </div>
</template>

<style scoped>
.card-stage {
    position: relative;
    z-index: 10;
    width: 340px;
    max-width: calc(100vw - 40px);
    /* 3D 透视：翻转的关键 */
    perspective: 1600px;
}

.auth-card {
    position: relative;
    width: 100%;
    transform-style: preserve-3d;
    transition: transform 0.85s cubic-bezier(0.68, -0.35, 0.27, 1.35);
    will-change: transform;
}
.auth-card.flipped {
    transform: rotateY(180deg);
}

/* 磨砂玻璃卡面 */
.card-face {
    top: 0;
    left: 0;
    width: 100%;
    padding: 34px 30px 40px;
    border-radius: 24px;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;

    background: linear-gradient(
        160deg,
        rgba(var(--color-card-rgb), 0.2),
        rgba(var(--color-card-rgb), 0.1)
    );
    border: 1px solid rgba(var(--color-card-2-rgb), 0.55);
    box-shadow: 0 24px 60px -18px var(--color-shader),
        inset 0 1px 0 rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(22px) saturate(1.4);
    -webkit-backdrop-filter: blur(22px) saturate(1.4);
    transition: background 0.5s ease, border-color 0.5s ease;
}
/* 正面在文档流里，负责撑起高度；背面绝对定位叠在同一位置并预翻转 */
.card-face--front {
    position: relative;
}
.card-face--back {
    position: absolute;
    transform: rotateY(180deg);
}

.card-head {
    text-align: center;
    margin-bottom: 22px;
}
.card-logo {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 54px;
    height: 54px;
    border-radius: 16px;
    overflow: hidden;
    color: var(--color-main);
    background: rgba(var(--color-main-rgb), 0.12);
    margin-bottom: 14px;
    transition: background-color 0.5s ease, color 0.5s ease;
}
.card-logo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.card-head h1 {
    font-size: 1.35rem;
    font-weight: 600;
    color: var(--color-font);
    letter-spacing: 0.02em;
    transition: color 0.5s ease;
}
.card-head p {
    margin-top: 6px;
    font-size: 0.8rem;
    color: var(--color-font-2);
    transition: color 0.5s ease;
}

/* 分段切换控件 */
.seg {
    position: relative;
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding: 4px;
    margin-bottom: 20px;
    border-radius: 50px;
    background: rgba(var(--color-card-1-rgb), 0.6);
    border: 1px solid rgba(var(--color-card-2-rgb), 0.5);
    transition: background-color 0.5s ease, border-color 0.5s ease;
}
.seg-thumb {
    position: absolute;
    top: 4px;
    left: 4px;
    width: calc(50% - 4px);
    height: calc(100% - 8px);
    border-radius: 50px;
    background: var(--color-main);
    box-shadow: 0 4px 14px rgba(var(--color-main-rgb), 0.4);
    transition: transform 0.45s cubic-bezier(0.68, -0.3, 0.27, 1.3),
        background-color 0.5s ease, box-shadow 0.5s ease;
}
.seg[data-active='register'] .seg-thumb {
    transform: translateX(100%);
}
.seg button {
    position: relative;
    z-index: 1;
    padding: 9px 0;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--color-font-2);
    transition: color 0.3s ease;
}
.seg button.on {
    color: var(--color-font-r);
}

@media (prefers-reduced-motion: reduce) {
    .auth-card,
    .seg-thumb {
        transition: none;
    }
}
</style>
