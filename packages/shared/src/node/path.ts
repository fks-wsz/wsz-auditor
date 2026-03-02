import { dirname, isAbsolute, resolve } from 'path';
import { fileURLToPath } from 'url';

function getAppRootPath() {
  return process.cwd();
}

function getFilename(importMetaUrl: string) {
  return fileURLToPath(importMetaUrl);
}

function getDirname(importMetaUrl: string) {
  return dirname(getFilename(importMetaUrl));
}

function getDirFromPath(path: string) {
  return dirname(path);
}

function getAbsolutePath(filePath: string): string {
  if (isAbsolute(filePath)) {
    return filePath;
  }
  return resolve(getAppRootPath(), filePath);
}

export { getAppRootPath, getFilename, getDirname, getAbsolutePath, getDirFromPath };
