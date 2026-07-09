<script setup lang="ts">
/*
 * 全屏波浪背景
 * - 装饰层：底部多层 gentle-wave，左右流动、淡化，作为氛围
 * - 潮水层：换肤时涨/落的“深色潮水”，位于卡片之后（不遮挡卡片）
 *     covering=true  → 涨潮盖满全屏
 *     covering=false → 退潮落回底部
 *     snap=true      → 本次位移不加过渡（用于“盖住的瞬间”瞬移，避免穿帮）
 *     tideColor      → 潮水颜色（深色主题背景色）
 */
defineProps<{
    covering?: boolean
    snap?: boolean
    tideColor?: string
}>()
</script>

<template>
    <div
        class="wave-root"
        :class="{ cover: covering, snap }"
        :style="{ '--tide': tideColor }"
        aria-hidden="true"
    >
        <!-- 换肤潮水（最底层：涨落时不会遮挡上面的装饰波浪） -->
        <div class="tide">
            <div class="tide-sheet">
                <svg
                    class="tide-crest"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink"
                    viewBox="0 24 150 20"
                    preserveAspectRatio="none"
                >
                    <defs>
                        <path
                            id="tide-wave"
                            d="M -160 44 c 30 0 58 -18 88 -18 s 58 18 88 18 s 58 -18 88 -18 s 58 18 88 18 v 44 h -352 Z"
                        />
                    </defs>
                    <use xlink:href="#tide-wave" x="48" y="0" class="tide-w" />
                </svg>
            </div>
        </div>

        <!-- 装饰波浪（浮在潮水之上） -->
        <div class="wave-bg">
            <svg
                class="waves"
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                viewBox="0 24 150 28"
                preserveAspectRatio="none"
                shape-rendering="auto"
            >
                <defs>
                    <path
                        id="gentle-wave"
                        d="M -160 44 c 30 0 58 -18 88 -18 s 58 18 88 18 s 58 -18 88 -18 s 58 18 88 18 v 44 h -352 Z"
                    />
                </defs>
                <g class="parallax">
                    <use xlink:href="#gentle-wave" x="48" y="0" class="wave wave-1" />
                    <use xlink:href="#gentle-wave" x="48" y="3" class="wave wave-2" />
                    <use xlink:href="#gentle-wave" x="48" y="5" class="wave wave-3" />
                    <use xlink:href="#gentle-wave" x="48" y="7" class="wave wave-4" />
                </g>
            </svg>
        </div>
    </div>
</template>

<style scoped>
.wave-root {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    overflow: hidden;
}

/* ── 装饰波浪 ─────────────────────────────────────────── */
.wave-bg {
    position: absolute;
    inset: auto 0 0 0;
    height: 62vh;
    min-height: 380px;
    opacity: 0.55;
    filter: blur(1.5px);
    -webkit-mask-image: linear-gradient(to top, #000 60%, transparent);
    mask-image: linear-gradient(to top, #000 60%, transparent);
}
.waves {
    width: 100%;
    height: 100%;
    display: block;
}
.wave {
    fill: var(--color-main);
    transition: fill 0.5s ease;
}
.wave-1 {
    opacity: 0.18;
    animation: wave-move 30s cubic-bezier(0.55, 0.5, 0.45, 0.5) infinite;
}
.wave-2 {
    opacity: 0.12;
    fill: var(--color-card-2);
    animation: wave-move 22s cubic-bezier(0.55, 0.5, 0.45, 0.5) -3s infinite;
}
.wave-3 {
    opacity: 0.28;
    fill: var(--color-card-2);
    animation: wave-move 17s cubic-bezier(0.55, 0.5, 0.45, 0.5) -4s infinite;
}
.wave-4 {
    opacity: 0.5;
    animation: wave-move 13s cubic-bezier(0.55, 0.5, 0.45, 0.5) -6s infinite;
}

/* ── 换肤潮水 ─────────────────────────────────────────── */
.tide {
    position: absolute;
    inset: 0;
}
.tide-sheet {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 100%;
    background: var(--tide);
    transform: translateY(103%);
    transition: transform 0.68s cubic-bezier(0.5, 0, 0.2, 1);
    will-change: transform;
}
.wave-root.cover .tide-sheet {
    transform: translateY(0);
}
.wave-root.snap .tide-sheet {
    transition: none;
}
/* 潮水顶缘：贴在潮水正上方，作为涨落前缘，同样左右流动 */
.tide-crest {
    position: absolute;
    left: 0;
    right: 0;
    width: 100%;
    bottom: 100%;
    height: 12vh;
    min-height: 80px;
    margin-bottom: -1px;
    display: block;
}
.tide-w {
    fill: var(--tide);
    animation: wave-move 18s cubic-bezier(0.55, 0.5, 0.45, 0.5) infinite;
}

@keyframes wave-move {
    0% {
        transform: translate3d(-90px, 0, 0);
    }
    100% {
        transform: translate3d(85px, 0, 0);
    }
}

@media (prefers-reduced-motion: reduce) {
    .wave,
    .tide-w {
        animation: none;
    }
    .tide-sheet {
        transition-duration: 0.25s;
    }
}
</style>
