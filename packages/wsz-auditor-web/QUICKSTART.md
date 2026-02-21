# Web 项目快速启动指南

## 🚀 快速开始（3 步）

### 1️⃣ 安装依赖

```powershell
cd web
npm install
```

### 2️⃣ 构建项目

```powershell
npm run build
```

### 3️⃣ 启动服务

```powershell
node server/index.js
```

然后打开浏览器访问：**http://localhost:3000**

---

## 📁 项目概览

**技术栈**：

- Express (服务端)
- Vue 2 + SSR (客户端)
- TypeScript (Render 函数)
- PostCSS (样式处理)
- Webpack 5 (构建工具)

**特色功能**：
✨ 磨砂玻璃质感 (Glassmorphism)
🎨 动画背景色块
🌓 深色/浅色主题切换
⚡ 服务端渲染 (SSR)

---

## 🛠️ 开发模式

### 监听文件变化（推荐）

```powershell
# 终端 1: 监听客户端代码
npm run dev:client

# 终端 2: 监听服务端 Vue bundle
npm run dev:server

# 终端 3: 启动服务（自动重启）
npm run start:dev
```

### 一键启动所有开发进程

```powershell
npm run dev
```

---

## 📦 构建输出

运行 `npm run build` 后会生成：

```
web/
├── public/           # 客户端静态资源
│   ├── js/
│   │   ├── main.js      # 客户端主代码
│   │   └── vendor.js    # Vue 运行时
│   └── styles/
│       └── main.css     # 编译后的样式
└── dist/            # 服务端 SSR bundle
    └── vue-ssr-server-bundle.js
```

---

## ⚙️ 环境配置

在 `server/index.js` 中可以配置：

```javascript
const PORT = process.env.PORT || 3000; // 服务端口
const projectPath = process.env.AUDIT_PROJECT_PATH || '../test/local-4'; // 审计项目路径
```

或者设置环境变量：

```powershell
$env:PORT=8080
$env:AUDIT_PROJECT_PATH="E:\your-project-path"
node server/index.js
```

---

## 🎨 主题切换

- 应用会自动检测系统主题偏好
- 点击右上角的主题切换按钮可手动切换
- 用户选择会保存到 localStorage

---

## 🌐 浏览器兼容性

支持 2019 年以后的现代浏览器：

- ✅ Chrome/Edge 80+
- ✅ Firefox 75+
- ✅ Safari 13.1+

关键特性：

- `backdrop-filter` (毛玻璃效果): 自动添加 `-webkit-` 前缀
- CSS Grid: 全面支持
- CSS 自定义属性: 全面支持

---

## 📝 项目结构

```
web/
├── client/                  # 客户端代码
│   ├── components/         # Vue 组件（TypeScript render 函数）
│   │   ├── App.ts                # 根组件（包含动画背景）
│   │   ├── AuditDashboard.ts     # 审计仪表板
│   │   ├── VulnerabilityList.ts  # 漏洞列表
│   │   ├── PackageCard.ts        # 包卡片组件
│   │   └── ThemeToggle.ts        # 主题切换按钮
│   ├── app.ts              # Vue 应用工厂函数
│   ├── entry-client.ts     # 客户端入口（水合）
│   ├── entry-server.ts     # 服务端入口（SSR）
│   └── store.ts            # 响应式状态管理
├── server/                 # 服务端代码
│   ├── index.js           # Express 应用主入口
│   ├── renderer.js        # Vue SSR 渲染器
│   └── index.template.html # HTML 模板
├── styles/                # 样式文件
│   ├── main.css           # 样式入口（导入其他文件）
│   ├── variables.css      # CSS 变量（主题定义）
│   ├── glassmorphism.css  # 磨砂玻璃效果
│   ├── animations.css     # 背景动画
│   ├── layout.css         # 布局样式
│   └── components.css     # 组件样式
├── types/                 # TypeScript 类型定义
│   ├── shims-vue.d.ts     # Vue 模块声明
│   └── index.ts           # 导出公共类型
├── public/                # 静态资源（构建后生成）
├── dist/                  # 服务端构建输出
├── package.json
├── tsconfig.json          # 客户端 TypeScript 配置
├── postcss.config.js      # PostCSS 配置
├── .browserslistrc        # 浏览器兼容性配置
├── webpack.client.config.js
├── webpack.server.config.js
└── README.md
```

---

## 🔧 常见问题

### Q: 如何修改审计的项目路径？

A: 编辑 `server/index.js`，修改 `getAuditData` 函数中的 `projectPath` 变量，或设置 `AUDIT_PROJECT_PATH` 环境变量。

### Q: 如何自定义主题颜色？

A: 编辑 `styles/variables.css`，修改 CSS 变量（如 `--color-primary`、`--color-secondary` 等）。

### Q: 如何添加新组件？

A: 在 `client/components/` 创建新的 `.ts` 文件，使用 `Vue.extend()` 和 TypeScript render 函数。

### Q: 构建时间太长？

A: 开发时使用 `npm run dev:client` 和 `npm run dev:server` 监听模式，避免每次修改都完整构建。

---

## 📚 相关文档

- [Vue 2 文档](https://v2.vuejs.org/)
- [Vue SSR 指南](https://v2.ssr.vuejs.org/)
- [PostCSS 文档](https://postcss.org/)
- [Webpack 文档](https://webpack.js.org/)

---

## 📄 License

MIT
