interface GitHubRepoInfoParsedFromURL {
  owner: string;
  repo: string;
  publicPath: string;
}

interface GitHubRESTRepoContentInfo {
  default_branch: string;
}

export { GitHubRepoInfoParsedFromURL, GitHubRESTRepoContentInfo };
