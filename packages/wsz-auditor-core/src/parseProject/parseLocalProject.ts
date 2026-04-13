import { join } from 'path';
import { PackageJSON } from '../audit/types/index.js';
import { BaseError, getFileContent, isExist } from 'wsz-auditor-shared';

export async function parseLocalProject(projectAbsolutePath: string): Promise<PackageJSON> {
  const packageJsonPath = join(projectAbsolutePath, 'package.json');
  if (!isExist(packageJsonPath)) {
    throw new BaseError('File', 'NOT_EXIST', `Can not find package.json file at:${projectAbsolutePath}`);
  }
  const json = await getFileContent(packageJsonPath);
  return JSON.parse(json);
}
