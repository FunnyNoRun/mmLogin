<script setup lang="ts">
/*
 * 认证完成资料卡 —— 一张「身份档案」样式的宽卡片。
 *   校内：左栏头像 + 身份，右栏一卡通全字段网格，顶部盖「已盒」印章
 *   校外：窄卡片 + 昵称 + "这里没有为校外选手准备内容喵~"
 * 底部一排操作：清除数据库（演示用，红色危险）+ 退出登录。
 */
import type { Profile } from '~/types/auth'

const props = defineProps<{ profile: Profile }>()
const emit = defineEmits<{ logout: []; reset: []; upgrade: [] }>()

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
    <div
        class="mm-glass-card mm-glass-card--solid profile"
        :class="isInternal ? 'profile--internal' : 'profile--external'"
    >
        <!-- 档案头 -->
        <header class="profile__head">
            <div class="profile__head-title">
                <span class="profile__head-kicker">YULINSEC · 身份档案</span>
                <h1 class="profile__name">
                    {{ profile.nickname }}
                    <span class="profile__badge" :class="isInternal ? 'in' : 'out'">
                        {{ isInternal ? '校内选手' : '校外选手' }}
                    </span>
                </h1>
                <p v-if="isInternal" class="profile__sub">
                    QQ {{ profile.qq }} · {{ showReal ? '真人照片' : 'QQ 头像' }}
                </p>
            </div>
            <span v-if="isInternal" class="profile__stamp">已盒</span>
        </header>

        <!-- 校内：左身份 + 右字段 -->
        <div v-if="isInternal" class="profile__body">
            <aside class="profile__aside">
                <div class="profile__avatar">
                    <img
                        v-if="avatarSrc && !avatarBroken"
                        :src="avatarSrc"
                        alt="头像"
                        referrerpolicy="no-referrer"
                        @error="avatarBroken = true"
                    >
                    <span v-else class="profile__avatar-fallback"><AppIcon name="user" /></span>

                    <button
                        v-if="hasPhoto"
                        class="profile__avatar-toggle"
                        :aria-label="showReal ? '显示 QQ 头像' : '显示真人照片'"
                        :title="showReal ? '显示 QQ 头像' : '显示真人照片'"
                        @click="showReal = !showReal"
                    >
                        <AppIcon name="swap" />
                    </button>
                </div>

                <div class="profile__tease in">你被盒了~~</div>
            </aside>

            <ul class="profile__fields">
                <li v-for="f in fields" :key="f.label">
                    <span class="profile__f-icon"><AppIcon :name="f.icon" /></span>
                    <div class="profile__f-text">
                        <span class="profile__f-label">{{ f.label }}</span>
                        <span class="profile__f-value">{{ f.value }}</span>
                    </div>
                </li>
            </ul>
        </div>

        <!-- 校外：默认身份，标红提示可升级为校内 -->
        <div v-else class="profile__body profile__body--external">
            <div class="profile__avatar profile__avatar--out">
                <span class="profile__avatar-fallback"><AppIcon name="user" /></span>
            </div>
            <div class="profile__tease out">你当前是「校外选手」，尚未认证校内身份喵~</div>
            <p class="profile__empty">
                作为校外选手，你无需绑定校园身份即可参赛。若你是电子科大在校生，可认证为校内选手解锁完整身份档案。
            </p>
            <button class="profile__upgrade" type="button" @click="emit('upgrade')">
                <AppIcon name="qq" /> 认证为校内选手
            </button>
        </div>

        <!-- 操作区 -->
        <div class="profile__actions">
            <button class="profile__btn profile__btn--danger" type="button" @click="emit('reset')">
                <AppIcon name="trash" /> 清除数据库
            </button>
            <button class="profile__btn profile__btn--ghost" type="button" @click="emit('logout')">
                <AppIcon name="logout" /> 退出登录
            </button>
        </div>
    </div>
</template>

<style scoped>
.profile {
    padding: 30px 32px 30px;
}
.profile--internal {
    width: 680px;
}
.profile--external {
    width: 420px;
    text-align: center;
    /* 校外选手：整卡标红，提示身份未认证 */
    border-color: rgba(226, 112, 122, 0.45);
    box-shadow: 0 24px 60px -18px var(--color-shader),
        inset 0 1px 0 rgba(255, 255, 255, 0.25),
        0 0 0 1px rgba(226, 112, 122, 0.14);
}

/* ── 档案头 ─────────────────────────────────── */
.profile__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    padding-bottom: 20px;
    margin-bottom: 22px;
    border-bottom: 1px solid rgba(var(--color-card-2-rgb), 0.5);
}
.profile--external .profile__head {
    justify-content: center;
    text-align: center;
}
.profile__head-kicker {
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    color: var(--color-font-2);
}
.profile__name {
    margin-top: 8px;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-font);
    display: inline-flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
}
.profile--external .profile__name {
    justify-content: center;
}
.profile__badge {
    font-size: 0.68rem;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: var(--radius-xs);
}
.profile__badge.in {
    color: var(--color-main);
    background: rgba(var(--color-main-rgb), 0.16);
}
.profile__badge.out {
    color: #d9636e;
    background: rgba(226, 112, 122, 0.18);
}
.profile__sub {
    margin-top: 8px;
    font-size: 0.78rem;
    color: var(--color-font-2);
}

/* 「已盒」印章 */
.profile__stamp {
    flex-shrink: 0;
    align-self: center;
    padding: 8px 16px;
    font-size: 1.1rem;
    font-weight: 800;
    letter-spacing: 0.18em;
    color: #d9636e;
    border: 2.5px solid rgba(217, 99, 110, 0.7);
    border-radius: var(--radius-sm);
    transform: rotate(-9deg);
    opacity: 0.9;
}

/* ── 主体：两栏 ─────────────────────────────── */
.profile__body {
    display: grid;
    grid-template-columns: 190px 1fr;
    gap: 28px;
    align-items: start;
}
.profile__body--external {
    display: block;
}

.profile__aside {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
}

.profile__avatar {
    position: relative;
    width: 148px;
    height: 148px;
    border-radius: var(--radius-md);
}
.profile__avatar--out {
    width: 92px;
    height: 92px;
    margin: 0 auto 4px;
}
.profile__avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: var(--radius-md);
    background: rgba(var(--color-card-1-rgb), 0.8);
    box-shadow: 0 14px 34px -10px var(--color-shader);
}
.profile__avatar-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    border-radius: var(--radius-md);
    color: var(--color-main);
    background: rgba(var(--color-main-rgb), 0.14);
}
.profile__avatar-fallback svg {
    width: 46px;
    height: 46px;
}
.profile__avatar-toggle {
    position: absolute;
    right: -6px;
    bottom: -6px;
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-full);
    color: var(--color-font-r);
    background: var(--color-main);
    box-shadow: 0 6px 16px rgba(var(--color-main-rgb), 0.5);
    transition: transform 0.2s ease;
}
.profile__avatar-toggle:hover {
    transform: scale(1.1) rotate(-12deg);
}
.profile__avatar-toggle svg {
    width: 15px;
    height: 15px;
}

.profile__tease {
    width: 100%;
    text-align: center;
    font-size: 0.92rem;
    font-weight: 600;
    letter-spacing: 0.03em;
    padding: 12px;
    border-radius: var(--radius-sm);
}
.profile__tease.in {
    color: #d9636e;
    background: rgba(226, 112, 122, 0.14);
    border: 1px dashed rgba(226, 112, 122, 0.5);
}
.profile__tease.out {
    color: #d9636e;
    background: rgba(226, 112, 122, 0.12);
    border: 1px dashed rgba(226, 112, 122, 0.5);
    margin: 18px 0;
}

/* 校外 -> 校内 升级按钮（主按钮样式） */
.profile__upgrade {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    height: 46px;
    margin-top: 18px;
    border-radius: var(--radius-md);
    font-size: 0.92rem;
    font-weight: 600;
    color: var(--color-font-r);
    background: var(--color-main);
    box-shadow: 0 8px 22px rgba(var(--color-main-rgb), 0.35);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.profile__upgrade:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 28px rgba(var(--color-main-rgb), 0.45);
}
.profile__upgrade svg {
    width: 15px;
    height: 15px;
}

/* ── 字段网格：两列 ─────────────────────────── */
.profile__fields {
    list-style: none;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px 22px;
}
.profile__fields li {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 9px 4px;
    border-bottom: 1px solid rgba(var(--color-card-2-rgb), 0.4);
}
.profile__f-icon {
    display: flex;
    flex-shrink: 0;
    width: 30px;
    height: 30px;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-sm);
    color: var(--color-main);
    background: rgba(var(--color-main-rgb), 0.12);
}
.profile__f-icon svg {
    width: 14px;
    height: 14px;
}
.profile__f-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
}
.profile__f-label {
    font-size: 0.7rem;
    color: var(--color-font-2);
}
.profile__f-value {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--color-font);
    word-break: break-all;
}

.profile__empty {
    font-size: 0.85rem;
    line-height: 1.7;
    color: var(--color-font-2);
    padding: 0 6px;
}

/* ── 操作区 ─────────────────────────────────── */
.profile__actions {
    display: flex;
    gap: 12px;
    margin-top: 26px;
    padding-top: 22px;
    border-top: 1px solid rgba(var(--color-card-2-rgb), 0.5);
}
.profile__btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    height: 46px;
    border-radius: var(--radius-md);
    font-size: 0.9rem;
    font-weight: 600;
    transition: transform 0.2s ease, background 0.3s ease, box-shadow 0.2s ease,
        color 0.2s ease;
}
.profile__btn svg {
    width: 15px;
    height: 15px;
}
.profile__btn--ghost {
    color: var(--color-font-1);
    background: rgba(var(--color-card-1-rgb), 0.85);
}
.profile__btn--ghost:hover {
    background: rgba(var(--color-card-2-rgb), 0.95);
}
.profile__btn--danger {
    color: #d9636e;
    background: rgba(226, 112, 122, 0.12);
    border: 1px solid rgba(226, 112, 122, 0.4);
}
.profile__btn--danger:hover {
    transform: translateY(-2px);
    color: #fff;
    background: #e2707a;
    box-shadow: 0 10px 24px rgba(226, 112, 122, 0.4);
}

/* ── 响应式：窄屏收成单列 ───────────────────── */
@media (max-width: 720px) {
    .profile--internal,
    .profile--external {
        width: 100%;
    }
    .profile__body {
        grid-template-columns: 1fr;
        gap: 22px;
    }
    .profile__fields {
        grid-template-columns: 1fr;
    }
    .profile__head {
        flex-direction: column;
        align-items: center;
        text-align: center;
    }
    .profile__name {
        justify-content: center;
    }
    .profile__stamp {
        align-self: center;
    }
}
</style>
