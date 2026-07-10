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
