import { getAbsolutePath, getDirFromPath } from './path.js';
import { existsSync } from 'fs';
import { readFile, writeFile, rm, mkdir } from 'fs/promises';
import { BaseError } from '../error/index.js';

import type { MakeDirectoryOptions, RmDirOptions } from 'fs';

function isExist(filePath: string): boolean {
  const absolutePath = getAbsolutePath(filePath);
  return existsSync(absolutePath);
}

async function getFileContent(filePath: string): Promise<string> {
  if (!isExist(filePath)) return '';
  const absolutePath = getAbsolutePath(filePath);
  const content = await readFile(absolutePath, { encoding: 'utf-8' });
  return content;
}

async function createFile(data: string, filePath: string) {
  const absolutePath = getAbsolutePath(filePath);
  const absoluteDir = getDirFromPath(absolutePath);

  if (isExist(absolutePath)) {
    throw new BaseError('File', 'EXISTED', `创建时 ${absolutePath} 已存在`);
  }
  if (!isExist(absoluteDir)) {
    await createDir(absoluteDir, { recursive: true });
  }
  await writeFile(absolutePath, data, {
    encoding: 'utf-8',
  });
}

async function createJsonFile(filePath: string, jsonStr: object) {
  const absolutePath = getAbsolutePath(filePath);
  await writeFile(absolutePath, JSON.stringify(jsonStr, undefined, 2), {
    encoding: 'utf-8',
  });
}

async function getJsonFileContent<T extends object = object>(filePath: string): Promise<T> {
  const content = await getFileContent(filePath);
  return JSON.parse(content);
}

async function remove(target: string, options?: RmDirOptions) {
  const absolutePath = getAbsolutePath(target);
  if (!isExist(absolutePath)) return;
  await rm(absolutePath, options);
}

async function createDir(target: string, options?: MakeDirectoryOptions) {
  const absolutePath = getAbsolutePath(target);
  if (isExist(absolutePath)) {
    throw new BaseError('File', 'EXISTED', `创建时 ${target} 已存在`);
  }
  try {
    await mkdir(absolutePath, options);
  } catch (error) {
    throw new BaseError('File', 'WRITE_FAIL', `创建目录 ${target} 失败: ${(error as Error).message}`);
  }
  return absolutePath;
}

export { isExist, getFileContent, createFile, createJsonFile, getJsonFileContent, remove, createDir };
