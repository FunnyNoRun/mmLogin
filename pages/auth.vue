<script setup lang="ts">
/*
 * 认证页（私聊链接打开，设备B）：
 *   移动端优先开摄像头扫码，失败/拒绝则退回「拍照上传」
 *   PC 端上传一卡通背面二维码照片
 * 前端先粗校验二维码 url 格式，再交服务端解析 + 查卡片信息完成认证。
 */
import { isMobileUA } from '~/utils/qq'

const route = useRoute()
const { notify } = useToast()

const uuid = computed(() => String(route.query.uuid ?? '').trim())
const validLink = computed(() => /^[0-9a-fA-F-]{8,}$/.test(uuid.value))

const logoUrl = '/yulinsec.jpg'
const mobile = ref(false)
const mode = ref<'scan' | 'upload'>('upload')
const status = ref<'idle' | 'submitting' | 'success'>('idle')
const resultName = ref('')
const cameraError = ref(false)

const QR_RE = /^https?:\/\/hq\.uestc\.edu\.cn\/vc\?c=.+/i

const videoEl = ref<HTMLVideoElement | null>(null)
const canvasEl = ref<HTMLCanvasElement | null>(null)
const fileEl = ref<HTMLInputElement | null>(null)

let stream: MediaStream | null = null
let raf = 0
let jsqr: ((d: Uint8ClampedArray, w: number, h: number) => { data: string } | null) | null = null
let submitting = false

async function loadJsQR() {
    if (!jsqr) jsqr = (await import('jsqr')).default as any
    return jsqr!
}

function decode(imageData: ImageData): string | null {
    if (!jsqr) return null
    const code = jsqr(imageData.data, imageData.width, imageData.height)
    return code?.data ?? null
}

async function handleRaw(text: string) {
    if (submitting || status.value === 'success') return
    if (!QR_RE.test(text.trim())) {
        notify(false, '非法二维码：这不是一卡通认证码', { title: '识别失败' })
        return
    }
    await submit(text.trim())
}

async function submit(qr: string) {
    submitting = true
    status.value = 'submitting'
    try {
        const res = await $fetch<{ ok: boolean; message: string; name?: string }>('/api/card', {
            method: 'POST',
            body: { uuid: uuid.value, qr },
        })
        if (res.ok) {
            resultName.value = res.name || ''
            status.value = 'success'
            stopCamera()
            notify(true, '身份认证完成', { title: '认证成功' })
            return
        }
        notify(false, res.message || '认证失败', { title: '认证失败' })
        status.value = 'idle'
    } catch (e: any) {
        notify(false, e?.data?.message || '认证失败，请重试', { title: '认证失败' })
        status.value = 'idle'
    } finally {
        submitting = false
    }
}

// ── 摄像头扫码 ─────────────────────────────────────────────
async function startCamera() {
    try {
        await loadJsQR()
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
            audio: false,
        })
        mode.value = 'scan'
        cameraError.value = false
        await nextTick()
        const v = videoEl.value!
        v.srcObject = stream
        v.setAttribute('playsinline', 'true')
        await v.play()
        scanLoop()
    } catch {
        cameraError.value = true
        mode.value = 'upload'
        notify(false, '无法开启摄像头，请改用拍照上传', { title: '摄像头不可用' })
    }
}

function scanLoop() {
    const v = videoEl.value
    const c = canvasEl.value
    if (!v || !c || status.value === 'success') return
    if (v.readyState === v.HAVE_ENOUGH_DATA && !submitting) {
        const w = v.videoWidth
        const h = v.videoHeight
        if (w && h) {
            c.width = w
            c.height = h
            const ctx = c.getContext('2d', { willReadFrequently: true })!
            ctx.drawImage(v, 0, 0, w, h)
            const data = decode(ctx.getImageData(0, 0, w, h))
            if (data) {
                handleRaw(data)
            }
        }
    }
    raf = requestAnimationFrame(scanLoop)
}

function stopCamera() {
    if (raf) cancelAnimationFrame(raf)
    raf = 0
    if (stream) {
        stream.getTracks().forEach((t) => t.stop())
        stream = null
    }
}

// ── 拍照 / 上传解码 ────────────────────────────────────────
async function onFile(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    try {
        await loadJsQR()
        const bitmap = await createImageBitmap(file)
        const c = canvasEl.value!
        c.width = bitmap.width
        c.height = bitmap.height
        const ctx = c.getContext('2d', { willReadFrequently: true })!
        ctx.drawImage(bitmap, 0, 0)
        const data = decode(ctx.getImageData(0, 0, c.width, c.height))
        if (data) await handleRaw(data)
        else notify(false, '未在图片中识别到二维码，请换一张更清晰的', { title: '识别失败' })
    } catch {
        notify(false, '图片处理失败，请重试')
    } finally {
        if (fileEl.value) fileEl.value.value = ''
    }
}

function toScan() {
    startCamera()
}
function toUpload() {
    stopCamera()
    mode.value = 'upload'
}
function pickFile() {
    fileEl.value?.click()
}

onMounted(() => {
    mobile.value = isMobileUA()
    if (validLink.value && mobile.value) startCamera()
})
onBeforeUnmount(stopCamera)
</script>

<template>
    <div class="mm-glass-card auth-page">
        <header class="mm-card-head">
            <span class="mm-card-logo"><img :src="logoUrl" alt="YulinSec"></span>
            <h1>身份认证</h1>
            <p>上传 / 扫描一卡通背面二维码完成认证</p>
        </header>

        <!-- 无效链接 -->
        <div v-if="!validLink" class="auth-page__msg err">
            <span class="auth-page__msg-icon"><AppIcon name="xmark" /></span>
            <p>认证链接无效或已失效，请回到原设备重新发起认证。</p>
        </div>

        <!-- 成功 -->
        <div v-else-if="status === 'success'" class="auth-page__msg ok">
            <span class="auth-page__msg-icon"><AppIcon name="check" /></span>
            <h2>认证成功</h2>
            <p v-if="resultName">你好，<b>{{ resultName }}</b> 同学，身份已核验。</p>
            <p class="auth-page__msg-sub">请返回原设备查看你的认证资料，本页可关闭。</p>
        </div>

        <!-- 扫码 / 上传 -->
        <template v-else>
            <!-- 扫码取景框 -->
            <div v-show="mode === 'scan'" class="scanner">
                <video ref="videoEl" class="scanner__video" autoplay muted playsinline />
                <div class="scanner__frame">
                    <span class="scanner__corner tl" /><span class="scanner__corner tr" />
                    <span class="scanner__corner bl" /><span class="scanner__corner br" />
                    <span class="scanner__laser" />
                </div>
                <p class="scanner__hint">将二维码对准取景框，识别成功后自动提交</p>
            </div>

            <!-- 上传 / 拍照 -->
            <div v-show="mode === 'upload'" class="uploader" @click="pickFile">
                <span class="uploader__icon">
                    <AppIcon :name="mobile ? 'camera' : 'upload'" />
                </span>
                <p class="uploader__title">
                    {{ mobile ? '点击拍照上传' : '点击选择二维码照片' }}
                </p>
                <p class="uploader__hint">
                    {{ cameraError ? '摄像头不可用，改用拍照 / 相册上传' : '支持相册图片或屏幕截图' }}
                </p>
            </div>

            <input
                ref="fileEl"
                class="auth-page__file"
                type="file"
                accept="image/*"
                :capture="mobile ? 'environment' : undefined"
                @change="onFile"
            >

            <!-- 模式切换（仅移动端提供扫码/上传互切）-->
            <div v-if="mobile" class="auth-page__switch">
                <button v-if="mode === 'upload'" type="button" @click="toScan">
                    <AppIcon name="qrcode" /> 改用摄像头扫码
                </button>
                <button v-else type="button" @click="toUpload">
                    <AppIcon name="camera" /> 改用拍照上传
                </button>
            </div>

            <!-- 提交遮罩 -->
            <div v-if="status === 'submitting'" class="auth-page__loading">
                <AppIcon name="spinner" /> 正在核验身份…
            </div>
        </template>

        <canvas ref="canvasEl" class="auth-page__canvas" />
    </div>
</template>

<style scoped>
.auth-page {
    width: 360px;
}
.auth-page__canvas {
    display: none;
}
.auth-page__file {
    display: none;
}

/* 提示（无效 / 成功）*/
.auth-page__msg {
    text-align: center;
    padding: 10px 4px 6px;
}
.auth-page__msg-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    margin-bottom: 14px;
    border-radius: 20px;
    color: #fff;
}
.auth-page__msg.ok .auth-page__msg-icon {
    background: #57b894;
    box-shadow: 0 10px 24px rgba(87, 184, 148, 0.45);
}
.auth-page__msg.err .auth-page__msg-icon {
    background: #e2707a;
    box-shadow: 0 10px 24px rgba(226, 112, 122, 0.45);
}
.auth-page__msg-icon svg {
    width: 26px;
    height: 26px;
}
.auth-page__msg h2 {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--color-font);
    margin-bottom: 8px;
}
.auth-page__msg p {
    font-size: 0.86rem;
    line-height: 1.6;
    color: var(--color-font-1);
}
.auth-page__msg b {
    color: var(--color-main);
}
.auth-page__msg-sub {
    margin-top: 8px;
    font-size: 0.78rem !important;
    color: var(--color-font-2) !important;
}

/* 扫码取景 */
.scanner {
    position: relative;
    width: 100%;
    aspect-ratio: 1 / 1;
    border-radius: 18px;
    overflow: hidden;
    background: #000;
}
.scanner__video {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.scanner__frame {
    position: absolute;
    inset: 14%;
    pointer-events: none;
}
.scanner__corner {
    position: absolute;
    width: 26px;
    height: 26px;
    border: 3px solid var(--color-main);
}
.scanner__corner.tl {
    top: 0;
    left: 0;
    border-right: 0;
    border-bottom: 0;
    border-top-left-radius: 8px;
}
.scanner__corner.tr {
    top: 0;
    right: 0;
    border-left: 0;
    border-bottom: 0;
    border-top-right-radius: 8px;
}
.scanner__corner.bl {
    bottom: 0;
    left: 0;
    border-right: 0;
    border-top: 0;
    border-bottom-left-radius: 8px;
}
.scanner__corner.br {
    bottom: 0;
    right: 0;
    border-left: 0;
    border-top: 0;
    border-bottom-right-radius: 8px;
}
.scanner__laser {
    position: absolute;
    left: 6%;
    right: 6%;
    top: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--color-main), transparent);
    box-shadow: 0 0 10px 2px rgba(var(--color-main-rgb), 0.7);
    animation: mm-scan 2.4s ease-in-out infinite;
}
.scanner__hint {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 10px;
    text-align: center;
    font-size: 0.76rem;
    color: rgba(255, 255, 255, 0.9);
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
}

/* 上传区 */
.uploader {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 40px 20px;
    border-radius: 18px;
    text-align: center;
    cursor: pointer;
    border: 1.5px dashed rgba(var(--color-main-rgb), 0.45);
    background: rgba(var(--color-card-1-rgb), 0.5);
    transition: background 0.25s ease, border-color 0.25s ease;
}
.uploader:hover {
    background: rgba(var(--color-main-rgb), 0.1);
    border-color: rgba(var(--color-main-rgb), 0.7);
}
.uploader__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    border-radius: 18px;
    color: var(--color-main);
    background: rgba(var(--color-main-rgb), 0.14);
}
.uploader__icon svg {
    width: 26px;
    height: 26px;
}
.uploader__title {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--color-font);
}
.uploader__hint {
    font-size: 0.78rem;
    color: var(--color-font-2);
}

.auth-page__switch {
    margin-top: 16px;
    text-align: center;
}
.auth-page__switch button {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.8rem;
    color: var(--color-main);
    font-weight: 600;
}
.auth-page__switch svg {
    width: 14px;
    height: 14px;
}

.auth-page__loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 16px;
    font-size: 0.84rem;
    color: var(--color-font-1);
}
.auth-page__loading svg {
    width: 16px;
    height: 16px;
    animation: mm-spin 1s linear infinite;
}

@keyframes mm-scan {
    0% {
        top: 2%;
    }
    50% {
        top: 96%;
    }
    100% {
        top: 2%;
    }
}
@keyframes mm-spin {
    to {
        transform: rotate(360deg);
    }
}
@media (max-width: 400px) {
    .auth-page {
        width: 100%;
    }
}
@media (prefers-reduced-motion: reduce) {
    .scanner__laser,
    .auth-page__loading svg {
        animation: none;
    }
}
</style>
