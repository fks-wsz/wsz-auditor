import ejs from 'ejs';
import { join } from 'path';
import { getDirname } from 'wsz-auditor-shared/node';
import { RenderData } from './types/index.js';

const templatePath = join(getDirname(import.meta.url), '../../assets/ejs/render/index.ejs');

export function renderMarkdown(data: RenderData): Promise<string | Error | void> {
  return new Promise((resolve, reject) => {
    ejs.renderFile(templatePath, data, (err, str) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(str);
    });
  });
}
