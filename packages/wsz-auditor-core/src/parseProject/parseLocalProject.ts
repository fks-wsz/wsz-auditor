import { join } from 'path';
import { PackageJSON } from '../audit/types/index.js';
import { BaseError, getFileContent, isFileExist } from 'wsz-auditor-shared';

export async function parseLocalProject(projectAbsolutePath: string): Promise<PackageJSON> {
  const packageJsonPath = join(projectAbsolutePath, 'package.json');
  if (!isFileExist(packageJsonPath)) {
    throw new BaseError('File', 'NOT_EXIST', `在 ${projectAbsolutePath} 下未找到 package.json 文件`);
  }
  const json = await getFileContent(packageJsonPath);
  return JSON.parse(json);
}
