<script setup lang="ts">
/*
 * 「认证为校内选手」弹窗（资料页触发）。
 *   input   -> 输入 QQ「继续」，服务端校验在群后私聊发认证链接
 *   waiting -> 轮询认证结果，完成后 emit('done')
 * QQ 不在群时复用全局 useModal 弹「加群」引导。
 */
import type { StartResult, PollResult } from '~/types/auth'

const emit = defineEmits<{ done: []; close: [] }>()

const { notify } = useToast()
const { openGroupJoin } = useModal()

const logoUrl = '/yulinsec.jpg'
const phase = ref<'input' | 'waiting'>('input')
const qq = ref('')
const busy = ref(false)
const waitingQQ = ref('')
const waitingNick = ref('')

const qqValid = computed(() => /^\d{5,12}$/.test(qq.value))

function onQqInput(e: Event) {
    qq.value = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 12)
}

let timer: ReturnType<typeof setInterval> | undefined
function stopPolling() {
    if (timer) clearInterval(timer)
    timer = undefined
}

async function poll(uuid: string) {
    try {
        const res = await $fetch<PollResult>('/api/auth/poll', { params: { uuid } })
        if (res.status === 'done') {
            stopPolling()
            notify(true, '身份认证完成', { title: '认证成功' })
            emit('done')
        } else if (res.status === 'expired') {
            stopPolling()
            notify(false, '认证链接已超时，请重新发起', { title: '认证超时' })
            phase.value = 'input'
        } else if (res.status === 'failed') {
            stopPolling()
            notify(false, '认证失败，请重试')
            phase.value = 'input'
        }
    } catch {
        /* 单次轮询失败忽略，等下次 */
    }
}

async function onContinue() {
    if (busy.value) return
    if (!qqValid.value) {
        notify(false, '请输入正确的 QQ 号（5–12 位纯数字）')
        return
    }
    busy.value = true
    try {
        const res = await $fetch<StartResult>('/api/auth/start', {
            method: 'POST',
            body: { qq: qq.value },
        })
        if (!res.inGroup) {
            openGroupJoin()
            notify(false, 'QQ 不在招新群里，请先加群', { title: '无法认证' })
            return
        }
        waitingQQ.value = qq.value
        waitingNick.value = res.nickname || qq.value
        phase.value = 'waiting'
        notify(true, `已向 QQ ${qq.value} 发送认证链接`, { title: '请查收私聊' })
        stopPolling()
        timer = setInterval(() => poll(res.uuid!), 1600)
    } catch (e: any) {
        notify(false, e?.data?.message || '认证服务暂时不可用，请稍后再试')
    } finally {
        busy.value = false
    }
}

function backToInput() {
    stopPolling()
    phase.value = 'input'
}

onBeforeUnmount(stopPolling)
</script>

<template>
    <Transition name="upg" appear>
        <div class="upg-mask">
            <div class="upg mm-glass-card mm-glass-card--solid" role="dialog" aria-modal="true">
                <button class="upg__close" aria-label="关闭" @click="emit('close')">
                    <AppIcon name="xmark" />
                </button>

                <!-- 输入阶段 -->
                <template v-if="phase === 'input'">
                    <header class="mm-card-head">
                        <span class="mm-card-logo"><img :src="logoUrl" alt="YulinSec"></span>
                        <h1>认证为校内选手</h1>
                        <p>输入你在招新群里的 QQ 号，我们会私聊你认证链接</p>
                    </header>

                    <form class="mm-form mm-stagger" @submit.prevent="onContinue">
                        <label class="mm-field">
                            <AppIcon name="qq" class="mm-field-icon" />
                            <input
                                :value="qq"
                                type="text"
                                inputmode="numeric"
                                autocomplete="off"
                                placeholder="输入你的 QQ 号"
                                @input="onQqInput"
                            >
                        </label>
                        <button class="mm-submit" type="submit" :disabled="busy">
                            {{ busy ? '处理中…' : '继 续' }}
                        </button>
                    </form>
                </template>

                <!-- 等待阶段 -->
                <template v-else>
                    <div class="auth-wait">
                        <span class="auth-wait__spinner"><AppIcon name="spinner" /></span>
                        <h1>等待认证</h1>
                        <p class="auth-wait__lead">
                            已向 QQ <b>{{ waitingQQ }}</b>
                            <template v-if="waitingNick && waitingNick !== waitingQQ">（{{ waitingNick }}）</template>
                            发送认证链接
                        </p>
                        <p class="auth-wait__hint">
                            请在手机或电脑上打开 QQ 私聊里的链接，扫描 / 上传一卡通背面二维码完成认证，完成后本页会自动跳转。
                        </p>
                        <div class="auth-wait__dots"><span /><span /><span /></div>
                        <button class="mm-submit mm-submit--ghost" type="button" @click="backToInput">
                            返回重新输入
                        </button>
                    </div>
                </template>
            </div>
        </div>
    </Transition>
</template>

<style scoped>
.upg-mask {
    position: fixed;
    inset: 0;
    z-index: 45;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: rgba(0, 0, 0, 0.35);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
}
.upg {
    position: relative;
    width: 340px;
}
.upg__close {
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
.upg__close:hover {
    background: rgba(var(--color-card-2-rgb), 0.7);
    color: var(--color-font);
}
.upg__close svg {
    width: 13px;
    height: 13px;
}

/* 等待阶段 */
.auth-wait {
    text-align: center;
    padding: 6px 0 2px;
}
.auth-wait__spinner {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    margin-bottom: 16px;
    color: var(--color-main);
}
.auth-wait__spinner svg {
    width: 34px;
    height: 34px;
    animation: mm-spin 1s linear infinite;
}
.auth-wait h1 {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-font);
}
.auth-wait__lead {
    margin-top: 10px;
    font-size: 0.9rem;
    color: var(--color-font-1);
}
.auth-wait__lead b {
    color: var(--color-main);
}
.auth-wait__hint {
    margin-top: 10px;
    font-size: 0.8rem;
    line-height: 1.6;
    color: var(--color-font-2);
}
.auth-wait__dots {
    display: flex;
    justify-content: center;
    gap: 6px;
    margin: 20px 0 22px;
}
.auth-wait__dots span {
    width: 7px;
    height: 7px;
    border-radius: var(--radius-full);
    background: var(--color-main);
    opacity: 0.35;
    animation: mm-blink 1.2s ease-in-out infinite;
}
.auth-wait__dots span:nth-child(2) {
    animation-delay: 0.2s;
}
.auth-wait__dots span:nth-child(3) {
    animation-delay: 0.4s;
}

/* 进出场 */
.upg-enter-active,
.upg-leave-active {
    transition: opacity 0.28s ease;
}
.upg-enter-active .upg,
.upg-leave-active .upg {
    transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.28s ease;
}
.upg-enter-from,
.upg-leave-to {
    opacity: 0;
}
.upg-enter-from .upg,
.upg-leave-to .upg {
    opacity: 0;
    transform: translateY(16px) scale(0.96);
}

@keyframes mm-spin {
    to {
        transform: rotate(360deg);
    }
}
@keyframes mm-blink {
    0%,
    100% {
        opacity: 0.25;
        transform: translateY(0);
    }
    50% {
        opacity: 1;
        transform: translateY(-3px);
    }
}
@media (prefers-reduced-motion: reduce) {
    .upg-enter-active,
    .upg-leave-active,
    .auth-wait__spinner svg,
    .auth-wait__dots span {
        animation: none;
        transition: none;
    }
}
</style>
