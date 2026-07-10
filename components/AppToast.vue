<script setup lang="ts">
/*
 * 全局提示（右下角）—— 磨砂玻璃卡片，成功/失败双色。
 * 由 useToast() 驱动，登录/注册/认证等全站统一使用。
 */
const { toasts, dismiss } = useToast()
</script>

<template>
    <div class="mm-toasts" aria-live="polite">
        <TransitionGroup name="toast">
            <div
                v-for="t in toasts"
                :key="t.id"
                class="mm-toast"
                :class="t.ok ? 'ok' : 'err'"
                role="status"
                @click="dismiss(t.id)"
            >
                <span class="mm-toast__icon">
                    <AppIcon :name="t.ok ? 'check' : 'xmark'" />
                </span>
                <div class="mm-toast__body">
                    <strong v-if="t.title" class="mm-toast__title">{{ t.title }}</strong>
                    <span class="mm-toast__text">{{ t.text }}</span>
                </div>
            </div>
        </TransitionGroup>
    </div>
</template>

<style scoped>
.mm-toasts {
    position: fixed;
    right: 22px;
    bottom: 22px;
    z-index: 40;
    display: flex;
    flex-direction: column-reverse;
    gap: 12px;
    max-width: min(360px, calc(100vw - 32px));
    pointer-events: none;
}

.mm-toast {
    pointer-events: auto;
    cursor: pointer;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 13px 16px;
    border-radius: 16px;
    background: linear-gradient(
        160deg,
        rgba(var(--color-card-rgb), 0.82),
        rgba(var(--color-card-rgb), 0.66)
    );
    border: 1px solid rgba(var(--color-card-2-rgb), 0.6);
    box-shadow: 0 16px 40px -12px var(--color-shader),
        inset 0 1px 0 rgba(255, 255, 255, 0.22);
    backdrop-filter: blur(18px) saturate(1.5);
    -webkit-backdrop-filter: blur(18px) saturate(1.5);
}

.mm-toast__icon {
    flex-shrink: 0;
    width: 26px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    color: #fff;
}
.mm-toast__icon svg {
    width: 13px;
    height: 13px;
}
.mm-toast.ok .mm-toast__icon {
    background: #57b894;
    box-shadow: 0 4px 12px rgba(87, 184, 148, 0.5);
}
.mm-toast.err .mm-toast__icon {
    background: #e2707a;
    box-shadow: 0 4px 12px rgba(226, 112, 122, 0.5);
}

.mm-toast__body {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding-top: 2px;
}
.mm-toast__title {
    font-size: 0.86rem;
    font-weight: 600;
    color: var(--color-font);
}
.mm-toast__text {
    font-size: 0.8rem;
    line-height: 1.45;
    color: var(--color-font-1);
}

/* 进出场：从右侧滑入 */
.toast-enter-active,
.toast-leave-active {
    transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease;
}
.toast-enter-from,
.toast-leave-to {
    opacity: 0;
    transform: translateX(30px);
}
.toast-leave-active {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 100%;
}

@media (prefers-reduced-motion: reduce) {
    .toast-enter-active,
    .toast-leave-active {
        transition: opacity 0.2s ease;
    }
    .toast-enter-from,
    .toast-leave-to {
        transform: none;
    }
}
</style>
