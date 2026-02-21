# NPM 依赖安全审计 Web 可视化界面

基于 Express + Vue 2 SSR 的 NPM 依赖安全审计可视化 Web 应用。

## 技术栈

- **服务端**: Express.js + TypeScript
- **客户端**: Vue 2 + TypeScript (使用 render 函数)
- **样式**: 原生 CSS + PostCSS
- **构建工具**: Webpack 5
- **特性**:
  - 服务端渲染 (SSR)
  - 磨砂玻璃质感 (Glassmorphism)
  - 动画背景色块
  - 深色/浅色主题切换

## 快速开始

### 1. 安装依赖

```bash
cd web
npm install
```

### 2. 构建项目

```bash
# 构建客户端和服务端代码
npm run build

# 或分别构建
npm run build:client  # 构建客户端 (输出到 public/)
npm run build:server  # 构建服务端 Vue SSR bundle (输出到 dist/)
```

### 3. 运行服务

```bash
# 直接启动
node server/index.js

# 或使用 npm 脚本（开发模式，使用 nodemon 自动重启）
npm run start:dev
```

服务将在 `http://localhost:3000` 启动。

## 开发模式

开发模式下，可以同时监听客户端和服务端代码变化：

```bash
# 终端 1: 监听客户端代码变化
npm run dev:client

# 终端 2: 监听服务端代码变化
npm run dev:server

# 终端 3: 启动服务（使用 nodemon 自动重启）
npm run start:dev

# 或使用 concurrently 一键启动
npm run dev
```

## 项目结构

```
web/
├── client/                 # 客户端代码
│   ├── components/        # Vue 组件 (TypeScript render 函数)
│   │   ├── App.ts
│   │   ├── AuditDashboard.ts
│   │   ├── VulnerabilityList.ts
│   │   ├── PackageCard.ts
│   │   └── ThemeToggle.ts
│   ├── app.ts             # Vue 应用工厂
│   ├── entry-client.ts    # 客户端入口（水合）
│   ├── entry-server.ts    # 服务端入口（SSR）
│   └── store.ts           # 响应式状态管理
├── server/                # 服务端代码
│   ├── index.ts          # Express 应用
│   ├── renderer.ts       # Vue SSR 渲染器
│   └── index.template.html  # HTML 模板
├── styles/               # 样式文件
│   ├── main.css          # 样式入口
│   ├── variables.css     # CSS 变量（主题）
│   ├── glassmorphism.css # 磨砂玻璃效果
│   ├── animations.css    # 背景动画
│   ├── layout.css        # 布局样式
│   └── components.css    # 组件样式
├── types/                # TypeScript 类型定义
│   ├── shims-vue.d.ts
│   └── index.ts
├── public/               # 静态资源（构建输出）
│   ├── js/
│   └── styles/
├── dist/                 # 服务端构建输出
├── package.json
├── tsconfig.json
├── postcss.config.js
├── webpack.client.config.ts
└── webpack.server.config.ts
```

## 环境变量

在 `server/index.ts` 中配置：

- `PORT`: 服务端口（默认: 3000）
- `AUDIT_PROJECT_PATH`: 要审计的项目路径（默认: '../test/local-4'）

## 浏览器兼容性

项目配置支持 2019 年以后的现代浏览器：

- Chrome/Edge 80+
- Firefox 75+
- Safari 13.1+

主要特性兼容性：

- `backdrop-filter` (毛玻璃效果): Chrome 76+, Safari 9+
- CSS Grid: 所有现代浏览器
- CSS 自定义属性: 所有现代浏览器

## 主题系统

应用支持深色和浅色两种主题：

- 自动检测系统主题偏好
- 用户选择会保存到 `localStorage`
- 点击右上角按钮切换主题
- 所有颜色通过 CSS 变量定义，便于自定义

## 样式特性

### 磨砂玻璃效果

使用 `backdrop-filter: blur()` 实现，不支持的浏览器会降级到半透明背景。

### 动画背景

三个色块使用 CSS `@keyframes` 实现流动动画，支持主题切换时颜色过渡。

### 响应式设计

支持移动端和桌面端，使用 CSS Grid 自适应布局。

## 构建优化

- TypeScript 编译为 ES2020
- 代码分割（vendor chunk）
- CSS 提取为独立文件
- Source Map 支持

## License

MIT
