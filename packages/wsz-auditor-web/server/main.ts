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

// Static resource service
app.use(express.static(PUBLIC_PATH));
app.use(express.static(DIST_PATH));

if (__DEV__) {
  // Development environment: proxy /api/* requests to separate API process to avoid restarting SSR process when modifying API routes
  app.use(
    '/api',
    createProxyMiddleware({
      target: `http://localhost:${API_PORT}`,
      changeOrigin: true,
    }),
  );
} else {
  // Production environment: directly mount API routes
  const auditRouter = require('./router/audit').default;
  app.use(auditRouter);
}

let devServerReadyPromise: Promise<void>;

if (__DEV__) {
  devServerReadyPromise = setupDevServer(app, join(PUBLIC_PATH, 'index.template.html'), (devServerContext) => {
    initRendererDevOnly(devServerContext);
  });
  } else {
    // Initialize renderer
    initRenderer();
  }

export interface RenderContext {
  url: string;
  title: string;
  state: Record<keyof any, any>;
}

// await auditPackage(getAbsolutePath('../../../test/local-2'), getAbsolutePath('result.md'));
// SSR routes
app.get('/home', async (req, res) => {
  const data = {};

  const context: RenderContext = {
    url: req.url,
    title: 'NPM Dependency Security Audit Analysis',
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
