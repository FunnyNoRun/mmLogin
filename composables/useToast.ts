/*
 * 全局提示（右下角）。所有页面统一使用：
 *   const { notify } = useToast()
 *   notify(true, '登录成功')
 *   notify(false, '账号或密码错误', { title: '登录失败' })
 */
export interface ToastItem {
    id: number
    ok: boolean
    title?: string
    text: string
}

let seq = 0

export function useToast() {
    const toasts = useState<ToastItem[]>('mm-toasts', () => [])

    function dismiss(id: number) {
        const i = toasts.value.findIndex((t) => t.id === id)
        if (i !== -1) toasts.value.splice(i, 1)
    }

    function notify(
        ok: boolean,
        text: string,
        opts: { title?: string; duration?: number } = {}
    ) {
        const id = ++seq
        toasts.value.push({ id, ok, text, title: opts.title })
        if (import.meta.client) {
            setTimeout(() => dismiss(id), opts.duration ?? 3200)
        }
        return id
    }

    return { toasts, notify, dismiss }
}
