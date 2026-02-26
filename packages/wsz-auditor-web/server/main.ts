import express from 'express';
import { DIST_PATH, PUBLIC_PATH, TEMP_PATH } from '../shared/path';
import { renderPage, initRenderer, initRendererDevOnly } from './renderer';
import setupDevServer from '../build/setup-dev-server';
import { join } from 'path';
import open from 'open';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = process.env.PORT || 3000;
const API_PORT = process.env.API_PORT || 3001;

// 静态资源服务
app.use(express.static(PUBLIC_PATH));
app.use(express.static(DIST_PATH));

if (__DEV__) {
  // 开发环境：将 /api/* 请求代理到独立的 API 进程，避免修改 API 路由时重启 SSR 进程
  app.use(
    '/api',
    createProxyMiddleware({
      target: `http://localhost:${API_PORT}`,
      changeOrigin: true,
    }),
  );
} else {
  // 生产环境：直接挂载 API 路由
  const auditRouter = require('./router/audit').default;
  app.use(auditRouter);
}

let devServerReadyPromise: Promise<void>;

if (__DEV__) {
  devServerReadyPromise = setupDevServer(app, join(PUBLIC_PATH, 'index.template.html'), (devServerContext) => {
    initRendererDevOnly(devServerContext);
  });
} else {
  // 初始化渲染器
  initRenderer();
}

export interface RenderContext {
  url: string;
  title: string;
  state: Record<keyof any, any>;
}

// await auditPackage(getAbsolutePath('../../../test/local-2'), getAbsolutePath('result.md'));
// SSR 路由
app.get('/home', async (req, res) => {
  const data = {};

  const context: RenderContext = {
    url: req.url,
    title: 'NPM 依赖安全审计分析',
    state: data,
  };
  if (__DEV__) {
    await devServerReadyPromise;
  }
  await renderPage(res, context);
});

app.listen(PORT, () => {
  if (__DEV__) {
    open(`http://localhost:${PORT}`, {
      app: {
        name: 'chrome',
        arguments: ['--remote-debugging-port=9222', `--user-data-dir=${join(TEMP_PATH, '.chrome')}`],
      },
    });
  }
  console.log(`Server running at http://localhost:${PORT}`);
});
