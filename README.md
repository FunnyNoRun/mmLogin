# mmLogin

磨砂玻璃风格的登录 / 注册页 —— 配色与波浪灵感取自 [Stapxs-QQ-Lite](https://github.com/Stapxs/Stapxs-QQ-Lite-2.0) 的连接页。

- **技术栈**：Nuxt 3（Vue 3 + SSR）+ Nitro
- **部署目标**：Cloudflare Pages（`cloudflare-pages` preset）
- **特点**：全屏淡化波浪背景 + 半透明磨砂玻璃卡片；登录/注册 3D 翻转切换，切换时波浪涌起；明暗主题、密码显隐

## 开发

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

## 构建 & 部署到 Cloudflare Pages

```bash
pnpm build                       # 输出到 dist/
pnpm dlx wrangler pages deploy dist
# 或直接： pnpm deploy
```

也可在 Cloudflare 控制台连接 Git 仓库，构建命令 `pnpm build`、输出目录 `dist`。

## 目录结构

```
├─ pages/index.vue            # 认证页（组装波浪 + 卡片 + 主题切换 + 提示）
├─ components/
│  ├─ WaveBackground.vue      # 全屏淡化波浪
│  ├─ AuthCard.vue            # 磨砂玻璃 3D 翻转卡 + 分段切换
│  ├─ LoginForm.vue / RegisterForm.vue
│  └─ AppIcon.vue             # 内联 SVG 图标
├─ composables/
│  ├─ useAuth.ts              # 前端调用 /api（改后端不用动前端）
│  └─ useTheme.ts             # 明暗主题切换 + 持久化
├─ server/
│  ├─ api/login.post.ts       # 登录接口（桩，待接真实鉴权）
│  ├─ api/register.post.ts    # 注册接口（桩）
│  └─ utils/cloudflare.ts     # 预留：读取 D1 / KV / env 绑定
├─ types/auth.ts              # 前后端共享类型
├─ assets/css/                # theme.css（配色变量）+ main.css（全局样式）
└─ wrangler.toml              # Cloudflare 配置（D1/KV 绑定已注释预留）
```

## 接后端时怎么做

1. `wrangler.toml` 里取消注释并配置 D1 / KV 绑定；
2. 在 `server/api/*.post.ts` 里用 `useCloudflareEnv(event)` 取绑定，替换 `TODO` 处的逻辑；
3. 前端 `composables/useAuth.ts` 与页面无需改动。

> 当前登录/注册为演示桩：只校验非空并回显，不做真实鉴权。
