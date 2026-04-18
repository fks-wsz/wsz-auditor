import fs from 'fs';
import { join, dirname } from 'path';
import { createJsonFile, getJsonFileContent, runCommand } from 'wsz-auditor-shared/node';
import { TEST_LOCK_FILE_PATH } from '../common/path.js';

import type { PackageJSON } from '../audit/types/index.js';

// Write package.json
async function writePackageJson(workDir: string, packageJsonObj: PackageJSON) {
  const packageJsonPath = join(workDir, 'package.json');
  fs.mkdirSync(dirname(packageJsonPath), { recursive: true });
  await createJsonFile(packageJsonPath, packageJsonObj);
}

/**
 * create package-lock.json file at work dir
 * @param workDir
 * @returns
 */
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
  await runCommand(cmd, workDir); // Execute command in working directory
}

/**
 * Generate package-lock.json based on package.json
 * @param {string} workDir Working directory
 * @param {Object} packageJsonObj package.json object
 */
export async function generateLock(workDir: string, packageJsonObj: PackageJSON) {
  // 1. Write package.json to working directory
  await writePackageJson(workDir, packageJsonObj);
  // 2. Generate lock file
  await createLockFile(workDir);
}
