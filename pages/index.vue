<script setup lang="ts">
import type { AuthPayload } from '~/types/auth'

const { theme, setTheme } = useTheme()
const { login, register } = useAuth()

const mode = ref<'login' | 'register'>('login')
const busy = ref(false)

// ── 换肤：一片“深色的水” ────────────────────────────────
//   浅→深：卡片先变深（背景暂按住为浅色）→ 深色潮水【上升】盖住 → 松开背景
//   深→浅：深色潮水先瞬移盖满（深盖深不可见）→ 卡片变浅 → 潮水【下降】露出浅色
const THEME_BG = { light: '#f8f9fa', dark: '#2d2d2d' } as const
const TIDE_DARK = '#2d2d2d'
const covering = ref(false)
const snap = ref(false)
const switching = ref(false)
const tideColor = ref(TIDE_DARK)
const bgHold = ref(false)
const bgHoldColor = ref(THEME_BG.light)
const bgSnap = ref(false) // 松开背景时禁用过渡，避免露出未变完的浅色底

const nextFrame = () =>
    new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())))
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function switchTheme() {
    if (switching.value) return
    switching.value = true
    const next = theme.value === 'dark' ? 'light' : 'dark'
    tideColor.value = TIDE_DARK

    if (next === 'dark') {
        // 浅 → 深：卡片先变色，深色潮水随后【上升】
        bgHoldColor.value = THEME_BG.light
        bgHold.value = true // 背景按住为浅色，别提前变黑
        await nextFrame()
        setTheme('dark') // 卡片平滑变深（背景仍被按住为浅色）
        await wait(160) // 让卡片先开始变
        snap.value = false
        covering.value = true // 深色潮水上升盖住（可见）
        await wait(720)
        bgSnap.value = true // 藏在潮水后，背景要瞬间变深，不能走 0.4s 过渡
        bgHold.value = false // 松开：背景已是深色，藏在潮水后
        await nextFrame()
        snap.value = true
        covering.value = false // 潮水瞬移隐藏（深盖深，不可见）
        await nextFrame()
        snap.value = false
        bgSnap.value = false // 恢复过渡（此时背景已是深色，不会再补间）
    } else {
        // 深 → 浅：潮水先盖住换肤，再【下降】露出浅色
        snap.value = true
        covering.value = true // 瞬移盖满（深盖深，不可见）
        await nextFrame()
        setTheme('light') // 卡片平滑变浅（背景被潮水挡住）
        await nextFrame()
        snap.value = false
        await nextFrame()
        covering.value = false // 深色潮水下降，露出浅色（可见）
        await wait(720)
    }

    switching.value = false
}

// ── 结果提示 ───────────────────────────────────────────
const toast = reactive({ show: false, ok: true, text: '' })
let toastTimer: ReturnType<typeof setTimeout> | undefined
function notify(ok: boolean, text: string) {
    toast.ok = ok
    toast.text = text
    toast.show = true
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => (toast.show = false), 2600)
}
onBeforeUnmount(() => clearTimeout(toastTimer))

async function onSubmit(payload: AuthPayload) {
    if (!payload.account || !payload.password) {
        notify(false, '请填写账号和密码')
        return
    }
    busy.value = true
    try {
        const res = await (mode.value === 'login' ? login(payload) : register(payload))
        notify(res.ok, res.message)
    } catch {
        notify(false, '网络异常，请稍后再试')
    } finally {
        busy.value = false
    }
}
</script>

<template>
    <main
        class="mm-stage"
        :class="{ 'bg-snap': bgSnap }"
        :style="bgHold ? { background: bgHoldColor } : {}"
    >
        <WaveBackground :covering="covering" :snap="snap" :tide-color="tideColor" />

        <button
            class="theme-toggle"
            :disabled="switching"
            :aria-label="theme === 'dark' ? '切换到浅色' : '切换到深色'"
            @click="switchTheme"
        >
            <AppIcon :name="theme === 'dark' ? 'sun' : 'moon'" />
        </button>

        <AuthCard v-model:mode="mode" :busy="busy" @submit="onSubmit" />

        <Transition name="toast">
            <div v-if="toast.show" class="mm-toast" :class="toast.ok ? 'ok' : 'err'">
                {{ toast.text }}
            </div>
        </Transition>
    </main>
</template>

<style scoped>
/* 换肤瞬间（潮水盖住时）松开背景，需瞬切深色而非 0.4s 补间，否则潮水抽走会闪一下浅色底 */
.mm-stage.bg-snap {
    transition: none;
}

.mm-toast {
    position: fixed;
    top: 26px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 30;
    padding: 11px 22px;
    border-radius: 50px;
    font-size: 0.84rem;
    font-weight: 500;
    color: var(--color-font-r);
    background: var(--color-main);
    box-shadow: 0 10px 30px var(--color-shader);
    backdrop-filter: blur(8px);
}
.mm-toast.err {
    background: #e2707a;
    color: #fff;
}

.toast-enter-active,
.toast-leave-active {
    transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease;
}
.toast-enter-from,
.toast-leave-to {
    opacity: 0;
    transform: translate(-50%, -18px);
}
</style>
