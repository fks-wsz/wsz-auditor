import express from 'express';
import { DIST_PATH, PUBLIC_PATH, TEMP_PATH } from '../shared/path';
import { renderPage, initRenderer, initRendererDevOnly } from './renderer';
import setupDevServer from '../build/setup-dev-server';
import { join } from 'path';
import open from 'open';

const app = express();
const PORT = process.env.PORT || 3000;

// 静态资源服务
app.use(express.static(PUBLIC_PATH));
app.use(express.static(DIST_PATH));

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

// SSR 路由
app.get('/home', async (req, res) => {
  // const projectPath = getAbsolutePath('../../../test/local-2');
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
