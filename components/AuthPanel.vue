<script setup lang="ts">
/*
 * 登录后的「新生身份认证」面板（卡片背面内容）。
 *   input   -> 输入 QQ「继续」，或「以校外选手身份参赛」
 *   waiting -> 已私聊发送认证链接，轮询认证结果，完成后 emit('done')
 * QQ 不在群时弹出加群引导（全局 useModal）。
 */
import type { StartResult, PollResult } from '~/types/auth'

const props = defineProps<{ account?: string }>()
const emit = defineEmits<{ done: []; logout: [] }>()

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

async function onExternal() {
    if (busy.value) return
    busy.value = true
    try {
        await $fetch('/api/auth/external', { method: 'POST' })
        notify(true, '已以校外选手身份进入', { title: '认证完成' })
        emit('done')
    } catch {
        notify(false, '操作失败，请稍后再试')
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
    <div class="mm-glass-card auth-panel">
        <!-- 输入阶段 -->
        <template v-if="phase === 'input'">
            <header class="mm-card-head">
                <span class="mm-card-logo"><img :src="logoUrl" alt="YulinSec"></span>
                <h1>身份认证</h1>
                <p>完成新生身份认证以参加招新 CTF</p>
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

                <button
                    class="mm-submit mm-submit--ghost"
                    type="button"
                    :disabled="busy"
                    @click="onExternal"
                >
                    以校外选手身份参赛
                </button>
            </form>

            <button class="auth-panel__logout" type="button" @click="emit('logout')">
                退出登录{{ props.account ? `（${props.account}）` : '' }}
            </button>
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
</template>

<style scoped>
.auth-panel {
    display: block;
}
.auth-panel__logout {
    display: block;
    width: 100%;
    margin-top: 16px;
    font-size: 0.76rem;
    color: var(--color-font-2);
    text-align: center;
    transition: color 0.2s ease;
}
.auth-panel__logout:hover {
    color: var(--color-main);
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
    border-radius: 50%;
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
    .auth-wait__spinner svg,
    .auth-wait__dots span {
        animation: none;
    }
}
</style>
