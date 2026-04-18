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
 * Determine the code source platform through projectURI
 * @param {string} projectURI - Remote repository URL
 * @returns {string} Platform name, such as 'github', 'gitlab', 'gitee', 'bitbucket'
 * @throws {Error} Throws error if URL format is invalid or platform is not supported
 */
function getProjectSourceRepoType(projectURI: string): RepoType {
  let hostname: string;
  try {
    hostname = new URL(projectURI).hostname;
  } catch {
    throw new BaseError('Url', 'INVALID_URL', `Invalid URL: ${projectURI}`);
  }

  const platform = REPO_TYPE_HOST_MAP[hostname as RepoHostname];
  if (!platform) {
    throw new BaseError('Url', 'PROJECT_REPO_NOT_SUPPORT', `Unsupported repository address: ${projectURI}`);
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
 * Github repository parser
 */
class GithubRepoParser extends BaseRepoParser {
  constructor() {
    super('github');
  }

  private async getRepoInfo(projectURI: string): Promise<GitHubRepoInfoParsedFromURL> {
    try {
      const parsedUrl = new URL(projectURI);

      // Ensure it's github.com
      if (parsedUrl.hostname !== 'github.com') {
        throw new BaseError('Url', 'INVALID_GITHUB_URL', `Invalid GitHub URL: ${projectURI}`);
      }

      // Get path and filter out empty strings (like leading /)
      const parts = parsedUrl.pathname.split('/').filter(Boolean);

      // At least need owner and repo (two segments)
      if (parts.length < 2) {
        throw new BaseError('Url', 'INVALID_GITHUB_URL', `Invalid GitHub URL: ${projectURI}`);
      }

      const [owner, repo, ...restPath] = parts;

      // Construct path: if there are subsequent paths, concatenate with '/'; otherwise empty string
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
 * Repository parser factory
 * @param repoType Repository type
 * @returns Repository parser
 */
function repoParserFactory(repoType: RepoType): BaseRepoParser {
  if (repoType === 'github') {
    return new GithubRepoParser();
  }
  throw new BaseError('Url', 'REQUIRE_REPO_PARSER', `Repository ${repoType} requires a corresponding parser, but it is not implemented yet`);
}

/**
 * Get package.json address of the repository project
 * @param repoType Repository type
 * @param projectURI Repository address
 * @returns Repository package.json address
 */
function getPackageJsonUrlFromRepo(repoType: RepoType, projectURI: string): Promise<string> {
  const repoParser = repoParserFactory(repoType);
  if (typeof repoParser.parsePackageJsonUrl === 'function') {
    return repoParser.parsePackageJsonUrl(projectURI);
  }
  throw new BaseError(
    'Url',
    'REQUIRE_PARSE_PACKAGE_JSON_METHOD_FROM_REPO_PARSER',
    `Repository ${repoType} requires corresponding package.json parsing, currently not implemented`,
  );
}

/**
 * Get package.json file of remote repository project
 * @param projectURI Project repository address
 * @returns
 */
async function parseRemoteProject(projectURI: string): Promise<PackageJSON> {
  const repoType = getProjectSourceRepoType(projectURI);
  const packageJsonUrl = await getPackageJsonUrlFromRepo(repoType, projectURI);
  if (__DEV__) {
    info('package.json address:', packageJsonUrl);
  }
  return await fetch(packageJsonUrl).then((resp) => resp.json() as Promise<PackageJSON>);
}

export { parseRemoteProject };
