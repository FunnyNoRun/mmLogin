<script setup lang="ts">
/*
 * 认证完成资料卡。
 *   校内：QQ 头像（可切换真人照片）+ 全字段 + "你被盒了~~"
 *   校外：默认头像 + 昵称 + "这里没有为校外选手准备内容喵~"
 */
import type { Profile } from '~/types/auth'

const props = defineProps<{ profile: Profile }>()
const emit = defineEmits<{ logout: [] }>()

const isInternal = computed(() => props.profile.kind === 'internal')
const card = computed(() => props.profile.card ?? {})

// 头像：QQ 头像 <-> 真人照片
const showReal = ref(false)
const hasPhoto = computed(() => !!card.value.headpic)
const avatarSrc = computed(() => {
    if (!isInternal.value) return ''
    return showReal.value && hasPhoto.value ? (card.value.headpic as string) : props.profile.avatar
})
const avatarBroken = ref(false)
watch(avatarSrc, () => (avatarBroken.value = false))

// 字段表（仅展示存在的字段）
const fields = computed(() => {
    const c = card.value
    const rows: { label: string; value?: unknown; icon: any }[] = [
        { label: '姓名', value: c.name, icon: 'user' },
        { label: '学号', value: c.uestc_id || c.id, icon: 'id-card' },
        { label: '手机号', value: c.phone, icon: 'phone' },
        { label: '性别', value: c.sex, icon: 'user' },
        { label: '民族', value: c.minzu, icon: 'users' },
        { label: '学院', value: c.depart_name, icon: 'users' },
        { label: '专业', value: c.major_name, icon: 'nodes' },
        { label: '校区', value: c.campus, icon: 'nodes' },
        { label: '身份证号', value: c.identity_id, icon: 'id-card' },
        { label: '入学', value: c.in_school_date, icon: 'id-card' },
        { label: '毕业', value: c.leave_school_date, icon: 'id-card' },
    ]
    return rows.filter((r) => r.value)
})
</script>

<template>
    <div class="mm-glass-card mm-glass-card--solid profile">
        <!-- 头像 -->
        <div class="profile__top">
            <div class="profile__avatar">
                <img
                    v-if="isInternal && avatarSrc && !avatarBroken"
                    :src="avatarSrc"
                    alt="头像"
                    referrerpolicy="no-referrer"
                    @error="avatarBroken = true"
                >
                <span v-else class="profile__avatar-fallback"><AppIcon name="user" /></span>

                <button
                    v-if="isInternal && hasPhoto"
                    class="profile__avatar-toggle"
                    :aria-label="showReal ? '显示 QQ 头像' : '显示真人照片'"
                    :title="showReal ? '显示 QQ 头像' : '显示真人照片'"
                    @click="showReal = !showReal"
                >
                    <AppIcon name="swap" />
                </button>
            </div>

            <h1 class="profile__name">
                {{ profile.nickname }}
                <span class="profile__badge" :class="isInternal ? 'in' : 'out'">
                    {{ isInternal ? '校内选手' : '校外选手' }}
                </span>
            </h1>
            <p v-if="isInternal" class="profile__sub">QQ {{ profile.qq }} · {{ showReal ? '真人照片' : 'QQ 头像' }}</p>
        </div>

        <!-- 调侃 -->
        <div class="profile__tease" :class="isInternal ? 'in' : 'out'">
            {{ isInternal ? '你被盒了~~' : '这里没有为校外选手准备内容喵~' }}
        </div>

        <!-- 字段 -->
        <ul v-if="isInternal" class="profile__fields">
            <li v-for="f in fields" :key="f.label">
                <span class="profile__f-icon"><AppIcon :name="f.icon" /></span>
                <span class="profile__f-label">{{ f.label }}</span>
                <span class="profile__f-value">{{ f.value }}</span>
            </li>
        </ul>
        <p v-else class="profile__empty">
            作为校外选手，你无需绑定校园身份即可参赛。祝你玩得开心，拿下更多 flag！
        </p>

        <button class="mm-submit mm-submit--ghost profile__logout" type="button" @click="emit('logout')">
            <AppIcon name="logout" /> 退出登录
        </button>
    </div>
</template>

<style scoped>
.profile {
    width: 380px;
}
.profile__top {
    text-align: center;
    margin-bottom: 18px;
}
.profile__avatar {
    position: relative;
    width: 92px;
    height: 92px;
    margin: 0 auto 14px;
    border-radius: 24px;
    overflow: visible;
}
.profile__avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 24px;
    background: rgba(var(--color-card-1-rgb), 0.8);
    box-shadow: 0 10px 26px -8px var(--color-shader);
}
.profile__avatar-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    border-radius: 24px;
    color: var(--color-main);
    background: rgba(var(--color-main-rgb), 0.14);
}
.profile__avatar-fallback svg {
    width: 40px;
    height: 40px;
}
.profile__avatar-toggle {
    position: absolute;
    right: -6px;
    bottom: -6px;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    color: var(--color-font-r);
    background: var(--color-main);
    box-shadow: 0 6px 16px rgba(var(--color-main-rgb), 0.5);
    transition: transform 0.2s ease;
}
.profile__avatar-toggle:hover {
    transform: scale(1.1) rotate(-12deg);
}
.profile__avatar-toggle svg {
    width: 13px;
    height: 13px;
}

.profile__name {
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--color-font);
    display: inline-flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: center;
}
.profile__badge {
    font-size: 0.68rem;
    font-weight: 600;
    padding: 3px 9px;
    border-radius: 50px;
}
.profile__badge.in {
    color: var(--color-main);
    background: rgba(var(--color-main-rgb), 0.16);
}
.profile__badge.out {
    color: #e0a144;
    background: rgba(224, 161, 68, 0.18);
}
.profile__sub {
    margin-top: 8px;
    font-size: 0.78rem;
    color: var(--color-font-2);
}

.profile__tease {
    text-align: center;
    font-size: 0.92rem;
    font-weight: 600;
    letter-spacing: 0.03em;
    padding: 12px;
    margin-bottom: 18px;
    border-radius: 14px;
}
.profile__tease.in {
    color: #d9636e;
    background: rgba(226, 112, 122, 0.14);
    border: 1px dashed rgba(226, 112, 122, 0.5);
}
.profile__tease.out {
    color: var(--color-font-1);
    background: rgba(var(--color-card-1-rgb), 0.7);
    border: 1px dashed rgba(var(--color-card-2-rgb), 0.8);
}

.profile__fields {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 2px;
}
.profile__fields li {
    display: grid;
    grid-template-columns: 24px 68px 1fr;
    align-items: center;
    gap: 10px;
    padding: 10px 6px;
    border-bottom: 1px solid rgba(var(--color-card-2-rgb), 0.4);
}
.profile__fields li:last-child {
    border-bottom: 0;
}
.profile__f-icon {
    display: flex;
    color: var(--color-main);
}
.profile__f-icon svg {
    width: 14px;
    height: 14px;
}
.profile__f-label {
    font-size: 0.78rem;
    color: var(--color-font-2);
}
.profile__f-value {
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--color-font);
    text-align: right;
    word-break: break-all;
}

.profile__empty {
    font-size: 0.85rem;
    line-height: 1.7;
    color: var(--color-font-2);
    text-align: center;
    padding: 4px 6px 8px;
}

.profile__logout {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 22px;
}
.profile__logout svg {
    width: 14px;
    height: 14px;
}

@media (max-width: 430px) {
    .profile {
        width: 100%;
    }
}
</style>
