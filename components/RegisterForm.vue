<script setup lang="ts">
import type { AuthPayload } from '~/types/auth'

defineProps<{ busy?: boolean }>()
const emit = defineEmits<{ submit: [payload: AuthPayload] }>()

const account = ref('')
const password = ref('')
const showPwd = ref(false)

function onSubmit() {
    emit('submit', { account: account.value.trim(), password: password.value })
}
</script>

<template>
    <form class="mm-form mm-stagger" @submit.prevent="onSubmit">
        <label class="mm-field">
            <AppIcon name="user" class="mm-field-icon" />
            <input
                v-model="account"
                type="text"
                autocomplete="username"
                placeholder="输入昵称"
                required
            >
        </label>

        <label class="mm-field">
            <AppIcon name="lock" class="mm-field-icon" />
            <input
                v-model="password"
                :type="showPwd ? 'text' : 'password'"
                autocomplete="new-password"
                placeholder="设置密码"
                required
            >
            <button
                type="button"
                class="mm-eye"
                :aria-label="showPwd ? '隐藏密码' : '显示密码'"
                @click="showPwd = !showPwd"
            >
                <AppIcon :name="showPwd ? 'eye-slash' : 'eye'" />
            </button>
        </label>

        <button class="mm-submit" type="submit" :disabled="busy">
            {{ busy ? '注册中…' : '注 册' }}
        </button>
    </form>
</template>
