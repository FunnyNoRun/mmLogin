type Theme = 'light' | 'dark'

/*
 * 主题切换 —— 首屏防闪烁的初始值由 nuxt.config 里的 head script 设置，
 * 这里负责运行时切换与持久化。
 */
export function useTheme() {
    const theme = useState<Theme>('mm-theme', () => 'light')

    // 客户端挂载时读回 <html data-theme>（head script 已按 localStorage / 系统偏好设好）
    onMounted(() => {
        const current = document.documentElement.getAttribute('data-theme')
        if (current === 'dark' || current === 'light') {
            theme.value = current
        }
    })

    function apply(value: Theme) {
        theme.value = value
        if (import.meta.client) {
            document.documentElement.setAttribute('data-theme', value)
            try {
                localStorage.setItem('mm-theme', value)
            } catch {
                /* ignore */
            }
        }
    }

    function toggle() {
        apply(theme.value === 'dark' ? 'light' : 'dark')
    }

    return { theme, toggle, setTheme: apply }
}
