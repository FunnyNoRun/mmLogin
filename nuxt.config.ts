// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-01-01',
    devtools: { enabled: true },

    // 运行时配置（服务端私密项走环境变量注入；public 下发浏览器）
    runtimeConfig: {
        // funnybot 地址（服务端 -> funnybot，浏览器不直连）
        funnybotUrl: process.env.NUXT_FUNNYBOT_URL || 'http://funnybot.h3cof6.com',
        // mmLogin 与 funnybot 之间的硬编码鉴权 token（需与 funnybot routers/mm.py 一致）
        mmToken: process.env.NUXT_MM_TOKEN || 'mmfunny_7f3c9a12e8b64d5fa0c1b2d3e4f5a6b7',
        public: {
            // 站点公网地址（用于拼认证链接）；留空则用请求 origin 自动推断
            siteUrl: process.env.NUXT_PUBLIC_SITE_URL || '',
        },
    },

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
