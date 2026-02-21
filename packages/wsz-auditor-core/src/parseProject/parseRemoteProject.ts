import { BaseError } from 'wsz-auditor-shared/error';
import type { PackageJSON } from '../audit/types/index.js';
import type { GitHubRepoInfoParsedFromURL, GitHubRESTRepoContentInfo } from './types/index.js';
import { info } from '../common/stdio.js';

const REPO_TYPE_HOST_MAP = {
  'github.com': 'github',
  // 'gitlab.com': 'gitlab',
  // 'gitee.com': 'gitee',
  // 'bitbucket.org': 'bitbucket',
} as const;
const SUPPORTED_REPO_TYPES = Object.values(REPO_TYPE_HOST_MAP);

type RepoHostname = keyof typeof REPO_TYPE_HOST_MAP;
type RepoType = (typeof SUPPORTED_REPO_TYPES)[number];

/**
 * 通过 projectURI 判断代码来源平台
 * @param {string} projectURI - 远程仓库 URL
 * @returns {string} 平台名称，如 'github'、'gitlab'、'gitee'、'bitbucket'
 * @throws {Error} 如果 URL 格式不合法或平台不支持
 */
function getProjectSourceRepoType(projectURI: string): RepoType {
  let hostname: string;
  try {
    hostname = new URL(projectURI).hostname;
  } catch {
    throw new BaseError('Url', 'INVALID_URL', `无效的 URL: ${projectURI}`);
  }

  const platform = REPO_TYPE_HOST_MAP[hostname as RepoHostname];
  if (!platform) {
    throw new BaseError('Url', 'PROJECT_REPO_NOT_SUPPORT', `不支持的仓库地址: ${projectURI}`);
  }

  return platform;
}

abstract class BaseRepoParser {
  constructor(protected type: RepoType) {
    this.type = type;
  }

  abstract parsePackageJsonUrl(projectURI: string): Promise<string>;
}

/**
 * github 仓库解析器
 */
class GithubRepoParser extends BaseRepoParser {
  constructor() {
    super('github');
  }

  private async getRepoInfo(projectURI: string): Promise<GitHubRepoInfoParsedFromURL> {
    try {
      const parsedUrl = new URL(projectURI);

      // 确保是 github.com
      if (parsedUrl.hostname !== 'github.com') {
        throw new BaseError('Url', 'INVALID_GITHUB_URL', `无效的 GitHub URL: ${projectURI}`);
      }

      // 获取路径并去除空字符串（如开头的 /）
      const parts = parsedUrl.pathname.split('/').filter(Boolean);

      // 至少需要 owner 和 repo 两段
      if (parts.length < 2) {
        throw new BaseError('Url', 'INVALID_GITHUB_URL', `无效的 GitHub URL: ${projectURI}`);
      }

      const [owner, repo, ...restPath] = parts;

      // 构造 path：如果有后续路径，则以 '/' 开头拼接；否则为空字符串
      const publicPath = restPath.length > 0 ? '/' + restPath.join('/') : '';

      return { owner, repo, publicPath };
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error('Invalid URL: malformed or missing');
      }
      throw error;
    }
  }

  async parsePackageJsonUrl(projectURI: string): Promise<string> {
    const gitInfo = await this.getRepoInfo(projectURI);
    const { owner, repo, publicPath } = gitInfo;

    let rootPath: string = '';
    if (publicPath.startsWith('/tree/')) {
      const pathParts = publicPath.split('/').filter(Boolean);
      const [, version] = pathParts;
      rootPath = `tags/${version}`;
    } else {
      const url = `https://api.github.com/repos/${owner}/${repo}`;
      const info = await fetch(url).then((resp) => resp.json() as Promise<GitHubRESTRepoContentInfo>);
      rootPath = `heads/${info.default_branch}`;
    }
    return `https://raw.githubusercontent.com/${owner}/${repo}/${rootPath}/package.json`;
  }
}

/**
 * 仓库解析器工厂
 * @param repoType 仓库类型
 * @returns 仓库解析器
 */
function repoParserFactory(repoType: RepoType): BaseRepoParser {
  if (repoType === 'github') {
    return new GithubRepoParser();
  }
  throw new BaseError('Url', 'REQUIRE_REPO_PARSER', `仓库 ${repoType} 需要对应的解析器，但当前未实现`);
}

/**
 * 获取仓库项目package.json地址
 * @param repoType 仓库类型
 * @param projectURI 仓库地址
 * @returns 仓库package.json 地址
 */
function getPackageJsonUrlFromRepo(repoType: RepoType, projectURI: string): Promise<string> {
  const repoParser = repoParserFactory(repoType);
  if (typeof repoParser.parsePackageJsonUrl === 'function') {
    return repoParser.parsePackageJsonUrl(projectURI);
  }
  throw new BaseError(
    'Url',
    'REQUIRE_PARSE_PACKAGE_JSON_METHOD_FROM_REPO_PARSER',
    `仓库 ${repoType} 需要对应的 package.json 解析，当前未实现`,
  );
}

/**
 * 获取远程仓库项目的 package.json 文件
 * @param projectURI 项目仓库地址
 * @returns
 */
async function parseRemoteProject(projectURI: string): Promise<PackageJSON> {
  const repoType = getProjectSourceRepoType(projectURI);
  const packageJsonUrl = await getPackageJsonUrlFromRepo(repoType, projectURI);
  if (__DEV__) {
    info('package.json 地址：', packageJsonUrl);
  }
  return await fetch(packageJsonUrl).then((resp) => resp.json() as Promise<PackageJSON>);
}

export { parseRemoteProject };
