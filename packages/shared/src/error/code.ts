const File = {
  /** 文件不存在 */
  NOT_EXIST: 1,
  /** 文件已存在 */
  EXISTED: 2,
  /** 文件读取失败 */
  READ_FAIL: 3,
  /** 文件写入失败 */
  WRITE_FAIL: 4,
} as const;

const Url = {
  /** 项目所属仓库不支持 */
  PROJECT_REPO_NOT_SUPPORT: 1,
  /** URL 无效，格式错误或缺失 */
  INVALID_URL: 2,
  /** 需要仓库解析器 */
  REQUIRE_REPO_PARSER: 3,
  /** 需要 parsePackageJsonUrl 方法 */
  REQUIRE_PARSE_PACKAGE_JSON_METHOD_FROM_REPO_PARSER: 4,
  /** 无效的 GitHub URL */
  INVALID_GITHUB_URL: 5,
} as const;

const User = {
  /** 用户取消了操作 */
  CANCEL_ACTION: 1,
} as const;

const E_CODE_RECORD = {
  File,
  Url,
  User,
};

export default E_CODE_RECORD;
