import { createBundleRenderer } from 'vue-server-renderer';
import type { BundleRenderer } from 'vue-server-renderer';
import { getFileContent, getJsonFileContent } from 'wsz-auditor-shared/node';
import { Response } from 'express-serve-static-core';
import { RenderContext } from './main.js';
import { join } from 'path';
import { DIST_PATH, PUBLIC_PATH } from '../shared/path';

let renderer: null | BundleRenderer = null;

/**
 * 初始化 Vue SSR 渲染器
 */
export async function initRenderer() {
  if (renderer) return renderer;

  const template = await getFileContent(join(PUBLIC_PATH, 'index.template.html'));
  const serverBundle = await getJsonFileContent(join(DIST_PATH, './server/vue-ssr-server-bundle.json'));
  const clientManifest = await getJsonFileContent(join(DIST_PATH, './client/vue-ssr-client-manifest.json'));

  renderer = createBundleRenderer(serverBundle, {
    template,
    clientManifest,
    runInNewContext: false,
  });

  return renderer;
}

export function initRendererDevOnly({ clientManifest, serverBundle, templateStr }: any) {
  if (renderer) return renderer;
  renderer = createBundleRenderer(serverBundle, {
    template: templateStr,
    clientManifest,
    runInNewContext: false,
  });

  return renderer;
}

/**
 * 渲染页面
 */
export async function renderPage(res: Response, context: RenderContext) {
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
      return null;
    });
  } catch (err) {
    console.error('SSR render error:', err);
    res.status(500).send('Internal Server Error');
  }
}
