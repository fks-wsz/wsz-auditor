import fs from 'fs';
import { join, dirname } from 'path';
import { createJsonFile, getJsonFileContent, runCommand } from 'wsz-auditor-shared/node';
import { TEST_LOCK_FILE_PATH } from '../common/path.js';

import type { PackageJSON } from '../audit/types/index.js';
import Loading from '../common/loading.js';

// 写入 package.json
async function writePackageJson(workDir: string, packageJsonObj: PackageJSON) {
  const packageJsonPath = join(workDir, 'package.json');
  fs.mkdirSync(dirname(packageJsonPath), { recursive: true });
  await createJsonFile(packageJsonPath, packageJsonObj);
}

// 创建 lock 文件
async function createLockFile(workDir: string) {
  if (__DEV__) {
    if (__DEBUG__) {
      const testLockFileContent = await getJsonFileContent(TEST_LOCK_FILE_PATH);
      const lockFilePath = join(workDir, 'package-lock.json');
      await createJsonFile(lockFilePath, testLockFileContent);
      return;
    }
  }
  const cmd = `npm install --package-lock-only --force`;
  await runCommand(cmd, workDir); // 在工作目录中执行命令
}

/**
 * 根据package.json 生成package-lock.json
 * @param {string} workDir 工作目录
 * @param {Object} packageJsonObj package.json对象
 */
export async function generateLock(workDir: string, packageJsonObj: PackageJSON) {
  Loading.updateMessage('解析项目依赖中');
  // 1. 将 package.json 写入工作目录
  await writePackageJson(workDir, packageJsonObj);
  // 2. 生成 lock 文件
  await createLockFile(workDir);
}
