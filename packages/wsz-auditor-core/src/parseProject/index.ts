import { PackageJSON } from '../audit/types/index.js';
import { parseLocalProject } from './parseLocalProject.js';
import { parseRemoteProject } from './parseRemoteProject.js';
import { getAbsolutePath } from 'wsz-auditor-shared/node';

/**
 * Parse package.json file in the project root directory
 * @param {string} projectPath Project root directory locally or URL of remote repository
 * @example
 * parseProject('/path/to/local/project');
 * parseProject('https://github.com/webpack/webpack');
 * @returns {Promise<Object>} Returns parsed package.json content
 * @throws {Error} Throws error if parsing fails or file does not exist
 */
export function parseProject(projectPath: string): Promise<PackageJSON> {
  if (projectPath.startsWith('http://') || projectPath.startsWith('https://')) {
    return parseRemoteProject(projectPath);
  }

  const projectAbsolutePath = getAbsolutePath(projectPath);

  return parseLocalProject(projectAbsolutePath);
}
