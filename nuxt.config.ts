// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-01-01',
    devtools: { enabled: true },

    // 服务端渲染（SSR）—— 部署到 Cloudflare 时由 Nitro 输出 Workers 函数
    ssr: true,

    nitro: {
        // Cloudflare Pages 预设：`nuxt build` 会输出到 dist/，可直接 `wrangler pages deploy dist`
        // 如果之后改用 Workers 独立部署，可切换为 'cloudflare-module'
        preset: 'cloudflare-pages',
    },

    css: [
        '~/assets/css/theme.css',
        '~/assets/css/main.css',
    ],

    app: {
        head: {
            title: 'YulinSec',
            htmlAttrs: { lang: 'zh-CN' },
            meta: [
                { charset: 'utf-8' },
                { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
                { name: 'description', content: 'mmLogin · YulinSec 登陆页面Demo' },
            ],
            // 首屏前同步设置主题，避免明暗主题闪烁（FOUC）
            script: [
                {
                    innerHTML: `(function(){try{var t=localStorage.getItem('mm-theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`,
                    tagPosition: 'head',
                },
            ],
        },
    },
})
