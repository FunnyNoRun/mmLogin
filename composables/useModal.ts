/*
 * 全局弹窗。目前有三种：
 *   group-join  「你还没加群」引导（含 PC / 移动 QQ 深链接）
 *   info        通用信息弹窗
 *   confirm     带「取消 / 确认」双按钮的确认弹窗（可标记为危险操作）
 */
export interface ModalState {
    open: boolean
    kind: 'group-join' | 'info' | 'confirm'
    title: string
    message: string
    /** confirm 变体：确认按钮文案 */
    confirmText?: string
    /** confirm 变体：是否为危险操作（红色确认按钮） */
    danger?: boolean
    /** confirm 变体：点击确认后的回调 */
    onConfirm?: () => void | Promise<void>
}

export function useModal() {
    const state = useState<ModalState>('mm-modal', () => ({
        open: false,
        kind: 'info',
        title: '',
        message: '',
    }))

    function close() {
        state.value.open = false
    }

    function openGroupJoin() {
        state.value = {
            open: true,
            kind: 'group-join',
            title: '你还不在招新群里',
            message: '完成新生认证需要先加入 YulinSec 招新 QQ 群，加群后再回来点击「继续」即可。',
        }
    }

    function openInfo(title: string, message: string) {
        state.value = { open: true, kind: 'info', title, message }
    }

    function openConfirm(opts: {
        title: string
        message: string
        confirmText?: string
        danger?: boolean
        onConfirm: () => void | Promise<void>
    }) {
        state.value = {
            open: true,
            kind: 'confirm',
            title: opts.title,
            message: opts.message,
            confirmText: opts.confirmText ?? '确认',
            danger: opts.danger ?? false,
            onConfirm: opts.onConfirm,
        }
    }

    return { state, close, openGroupJoin, openInfo, openConfirm }
}
