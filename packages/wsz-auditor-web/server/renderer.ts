import { createBundleRenderer } from 'vue-server-renderer';
import type { BundleRenderer } from 'vue-server-renderer';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Request, Response } from 'express-serve-static-core';
import { RenderContext } from './main.js';

let renderer: null | BundleRenderer = null;

/**
 * 初始化 Vue SSR 渲染器
 */
export async function initRenderer() {
  const template = readFileSync(resolve(__dirname, './index.template.html'), 'utf-8');
  const serverBundle = JSON.parse(
    readFileSync(resolve(__dirname, '../dist/server/vue-ssr-server-bundle.json'), 'utf-8'),
  );
  const clientManifest = JSON.parse(
    readFileSync(resolve(__dirname, '../dist/client/vue-ssr-client-manifest.json'), 'utf-8'),
  );

  renderer = createBundleRenderer(serverBundle, {
    template,
    clientManifest,
    runInNewContext: false,
  });

  return renderer;
}

/**
 * 渲染页面
 */
export async function renderPage(req: Request, res: Response, context: RenderContext) {
  if (!renderer) {
    renderer = await initRenderer();
  }

  try {
    renderer.renderToString(context, (err, html) => {
      if (err) {
        console.error('SSR render error:', err);
        return res.status(500).send('Internal Server Error');
      }
      res.end(html);
    });
  } catch (err) {
    console.error('SSR render error:', err);
    res.status(500).send('Internal Server Error');
  }
}
