<script setup lang="ts">
/*
 * 全站基础布局：波浪背景 + 右上角主题切换（含换肤潮水动画）+ 全局提示/弹窗。
 * 所有页面共用这套「固定组件」，页面内容通过 <slot /> 注入并居中/可滚动。
 */
const { theme, setTheme } = useTheme()

// ── 换肤：一片"深色的水"（从原 index.vue 迁移而来）──────────────
const THEME_BG = { light: '#f8f9fa', dark: '#2d2d2d' } as const
const TIDE_DARK = '#2d2d2d'
const covering = ref(false)
const snap = ref(false)
const switching = ref(false)
const tideColor = ref(TIDE_DARK)
const bgHold = ref(false)
const bgHoldColor = ref(THEME_BG.light)
const bgSnap = ref(false)

const nextFrame = () =>
    new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())))
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function switchTheme() {
    if (switching.value) return
    switching.value = true
    const next = theme.value === 'dark' ? 'light' : 'dark'
    tideColor.value = TIDE_DARK

    if (next === 'dark') {
        bgHoldColor.value = THEME_BG.light
        bgHold.value = true
        await nextFrame()
        setTheme('dark')
        await wait(160)
        snap.value = false
        covering.value = true
        await wait(720)
        bgSnap.value = true
        bgHold.value = false
        await nextFrame()
        snap.value = true
        covering.value = false
        await nextFrame()
        snap.value = false
        bgSnap.value = false
    } else {
        snap.value = true
        covering.value = true
        await nextFrame()
        setTheme('light')
        await nextFrame()
        snap.value = false
        await nextFrame()
        covering.value = false
        await wait(720)
    }

    switching.value = false
}
</script>

<template>
    <div class="mm-root" :class="{ 'bg-snap': bgSnap }" :style="bgHold ? { background: bgHoldColor } : {}">
        <WaveBackground :covering="covering" :snap="snap" :tide-color="tideColor" />

        <a
            class="gh-link"
            href="https://github.com/FunnyNoRun/mmLogin"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="在 GitHub 上查看源码"
            title="在 GitHub 上查看源码"
        >
            <AppIcon name="github" />
        </a>

        <button
            class="theme-toggle"
            :disabled="switching"
            :aria-label="theme === 'dark' ? '切换到浅色' : '切换到深色'"
            @click="switchTheme"
        >
            <AppIcon :name="theme === 'dark' ? 'sun' : 'moon'" />
        </button>

        <main class="mm-stage">
            <div class="mm-stage__inner">
                <slot />
            </div>
        </main>

        <AppToast />
        <AppModal />
    </div>
</template>

<style scoped>
/* 右上角 GitHub 链接：与主题切换按钮同款磨砂圆钮，排在它左侧 */
.gh-link {
    position: fixed;
    top: 22px;
    right: 78px;
    z-index: 20;
    width: 42px;
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-full);
    color: var(--color-font-1);
    background: rgba(var(--color-card-rgb), 0.45);
    border: 1px solid rgba(var(--color-card-2-rgb), 0.6);
    backdrop-filter: blur(12px) saturate(1.2);
    -webkit-backdrop-filter: blur(12px) saturate(1.2);
    box-shadow: 0 4px 20px var(--color-shader);
    transition: transform 0.3s ease, background 0.3s ease, color 0.3s ease,
        border-color 0.5s ease;
}
.gh-link:hover {
    transform: translateY(-2px) scale(1.06);
    color: var(--color-main);
}
.gh-link:active {
    transform: scale(0.94);
}
.gh-link svg {
    width: 20px;
    height: 20px;
}

.mm-root {
    position: relative;
    height: 100vh;
    height: 100dvh;
    width: 100%;
    overflow: hidden;
    background:
        radial-gradient(120% 80% at 50% -10%, rgba(var(--color-main-rgb), 0.16), transparent 60%),
        var(--color-bg);
    transition: background 0.4s ease;
}
/* 换肤瞬间松开背景需瞬切，否则潮水抽走会闪浅色底 */
.mm-root.bg-snap {
    transition: none;
}

/* 可滚动舞台：短内容居中，长内容（资料页/移动端）自然滚动 */
.mm-stage {
    position: relative;
    z-index: 10;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
}
.mm-stage__inner {
    min-height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 16px;
    box-sizing: border-box;
}
</style>
