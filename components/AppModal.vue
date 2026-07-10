<script setup lang="ts">
/*
 * 全局弹窗（居中磨砂玻璃卡片），由 useModal() 驱动。
 * group-join 变体额外提供 PC / 移动端一键加群深链接。
 */
import { GROUP_ID, GROUP_LINK_PC, GROUP_LINK_MOBILE, isMobileUA } from '~/utils/qq'

const { state, close } = useModal()

const mobile = ref(false)
onMounted(() => (mobile.value = isMobileUA()))

const confirming = ref(false)
async function onConfirm() {
    if (confirming.value) return
    const cb = state.value.onConfirm
    confirming.value = true
    try {
        await cb?.()
        close()
    } finally {
        confirming.value = false
    }
}

// 按当前设备选深链接：移动端给移动深链接，PC 给 PC 深链接
const primaryLink = computed(() => (mobile.value ? GROUP_LINK_MOBILE : GROUP_LINK_PC))

function openGroup(link: string) {
    // 深链接：新开一个隐藏跳转，避免污染当前页历史
    window.location.href = link
}
</script>

<template>
    <Transition name="modal">
        <div v-if="state.open" class="mm-modal-mask" @click.self="close">
            <div class="mm-modal" role="dialog" aria-modal="true">
                <button class="mm-modal__close" aria-label="关闭" @click="close">
                    <AppIcon name="xmark" />
                </button>

                <span
                    class="mm-modal__icon"
                    :class="{ warn: state.kind === 'group-join', danger: state.kind === 'confirm' && state.danger }"
                >
                    <AppIcon :name="state.kind === 'group-join' ? 'users' : state.kind === 'confirm' ? (state.danger ? 'trash' : 'check') : 'check'" />
                </span>

                <h3 class="mm-modal__title">{{ state.title }}</h3>
                <p class="mm-modal__msg">{{ state.message }}</p>

                <template v-if="state.kind === 'group-join'">
                    <div class="mm-modal__group">
                        <AppIcon name="qq" class="mm-modal__group-icon" />
                        <span>招新群号 {{ GROUP_ID }}</span>
                    </div>
                    <div class="mm-modal__actions">
                        <button class="mm-btn mm-btn--primary" @click="openGroup(primaryLink)">
                            <AppIcon name="qq" />
                            一键加群
                        </button>
                    </div>
                    <p class="mm-modal__hint">加群后回到「继续」再点一次即可完成校验</p>
                </template>

                <template v-else-if="state.kind === 'confirm'">
                    <div class="mm-modal__actions mm-modal__actions--row">
                        <button class="mm-btn mm-btn--ghost" :disabled="confirming" @click="close">
                            取消
                        </button>
                        <button
                            class="mm-btn"
                            :class="state.danger ? 'mm-btn--danger' : 'mm-btn--primary'"
                            :disabled="confirming"
                            @click="onConfirm"
                        >
                            {{ confirming ? '处理中…' : state.confirmText }}
                        </button>
                    </div>
                </template>

                <template v-else>
                    <div class="mm-modal__actions">
                        <button class="mm-btn mm-btn--primary" @click="close">好的</button>
                    </div>
                </template>
            </div>
        </div>
    </Transition>
</template>

<style scoped>
.mm-modal-mask {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: rgba(0, 0, 0, 0.35);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
}

.mm-modal {
    position: relative;
    width: 340px;
    max-width: calc(100vw - 40px);
    padding: 30px 26px 26px;
    border-radius: var(--radius-lg);
    text-align: center;
    background: linear-gradient(
        160deg,
        rgba(var(--color-card-rgb), 0.9),
        rgba(var(--color-card-rgb), 0.78)
    );
    border: 1px solid rgba(var(--color-card-2-rgb), 0.6);
    box-shadow: 0 30px 70px -20px var(--color-shader),
        inset 0 1px 0 rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(22px) saturate(1.5);
    -webkit-backdrop-filter: blur(22px) saturate(1.5);
}

.mm-modal__close {
    position: absolute;
    top: 14px;
    right: 14px;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-full);
    color: var(--color-font-2);
    transition: background 0.2s ease, color 0.2s ease;
}
.mm-modal__close:hover {
    background: rgba(var(--color-card-2-rgb), 0.7);
    color: var(--color-font);
}
.mm-modal__close svg {
    width: 13px;
    height: 13px;
}

.mm-modal__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 58px;
    height: 58px;
    margin-bottom: 16px;
    border-radius: var(--radius-md);
    color: var(--color-main);
    background: rgba(var(--color-main-rgb), 0.14);
}
.mm-modal__icon.warn {
    color: #e0a144;
    background: rgba(224, 161, 68, 0.16);
}
.mm-modal__icon.danger {
    color: #e2707a;
    background: rgba(226, 112, 122, 0.16);
}
.mm-modal__icon svg {
    width: 26px;
    height: 26px;
}

.mm-modal__title {
    font-size: 1.15rem;
    font-weight: 600;
    color: var(--color-font);
}
.mm-modal__msg {
    margin-top: 10px;
    font-size: 0.85rem;
    line-height: 1.6;
    color: var(--color-font-2);
}

.mm-modal__group {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin: 18px 0 4px;
    padding: 10px;
    border-radius: var(--radius-sm);
    font-size: 0.86rem;
    font-weight: 600;
    color: var(--color-font-1);
    background: rgba(var(--color-card-1-rgb), 0.7);
}
.mm-modal__group-icon {
    width: 16px;
    height: 16px;
    color: var(--color-main);
}

.mm-modal__actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 18px;
}
/* 确认弹窗：取消 / 确认横向并排 */
.mm-modal__actions--row {
    flex-direction: row;
}
.mm-modal__actions--row .mm-btn {
    flex: 1;
}
.mm-btn:disabled {
    opacity: 0.6;
    cursor: default;
    transform: none;
    box-shadow: none;
}
.mm-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    height: 44px;
    border-radius: var(--radius-md);
    font-size: 0.88rem;
    font-weight: 600;
    transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.3s ease;
}
.mm-btn svg {
    width: 15px;
    height: 15px;
}
.mm-btn--primary {
    color: var(--color-font-r);
    background: var(--color-main);
    box-shadow: 0 8px 22px rgba(var(--color-main-rgb), 0.35);
}
.mm-btn--primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 28px rgba(var(--color-main-rgb), 0.45);
}
.mm-btn--ghost {
    color: var(--color-font-1);
    background: rgba(var(--color-card-1-rgb), 0.8);
}
.mm-btn--ghost:hover {
    background: rgba(var(--color-card-2-rgb), 0.9);
}
.mm-btn--danger {
    color: #fff;
    background: #e2707a;
    box-shadow: 0 8px 22px rgba(226, 112, 122, 0.4);
}
.mm-btn--danger:hover {
    transform: translateY(-2px);
    background: #db5b66;
    box-shadow: 0 12px 28px rgba(226, 112, 122, 0.5);
}

.mm-modal__hint {
    margin-top: 14px;
    font-size: 0.74rem;
    color: var(--color-font-2);
}

/* 进出场 */
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.28s ease;
}
.modal-enter-active .mm-modal,
.modal-leave-active .mm-modal {
    transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.28s ease;
}
.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}
.modal-enter-from .mm-modal,
.modal-leave-to .mm-modal {
    opacity: 0;
    transform: translateY(16px) scale(0.96);
}
</style>
