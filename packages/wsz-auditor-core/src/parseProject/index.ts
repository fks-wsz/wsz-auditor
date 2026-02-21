import { PackageJSON } from '../audit/types/index.js';
import { parseLocalProject } from './parseLocalProject.js';
import { parseRemoteProject } from './parseRemoteProject.js';
import { getAbsolutePath } from 'wsz-auditor-shared/node';

/**
 * 解析工程根目录下的package.json文件
 * @param {string} projectPath 工程本地的根目录或远程仓库的URL
 * @example
 * parseProject('/path/to/local/project');
 * parseProject('https://github.com/webpack/webpack');
 * @returns {Promise<Object>} 返回解析后的package.json内容
 * @throws {Error} 如果解析失败或文件不存在
 */
export function parseProject(projectPath: string): Promise<PackageJSON> {
  if (projectPath.startsWith('http://') || projectPath.startsWith('https://')) {
    return parseRemoteProject(projectPath);
  }

  const projectAbsolutePath = getAbsolutePath(projectPath);

  return parseLocalProject(projectAbsolutePath);
}
