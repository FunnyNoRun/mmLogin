/*
 * 全局弹窗。目前有两种：
 *   group-join  「你还没加群」引导（含 PC / 移动 QQ 深链接）
 *   info        通用信息弹窗
 */
export interface ModalState {
    open: boolean
    kind: 'group-join' | 'info'
    title: string
    message: string
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

    return { state, close, openGroupJoin, openInfo }
}
