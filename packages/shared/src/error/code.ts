const File = {
  /** File does not exist */
  NOT_EXIST: 1,
  /** File already exists */
  EXISTED: 2,
  /** File read failed */
  READ_FAIL: 3,
  /** File write failed */
  WRITE_FAIL: 4,
} as const;

const Url = {
  /** Project repository is not supported */
  PROJECT_REPO_NOT_SUPPORT: 1,
  /** Invalid URL, malformed or missing */
  INVALID_URL: 2,
  /** Repository parser is required */
  REQUIRE_REPO_PARSER: 3,
  /** parsePackageJsonUrl method is required from repo parser */
  REQUIRE_PARSE_PACKAGE_JSON_METHOD_FROM_REPO_PARSER: 4,
  /** Invalid GitHub URL */
  INVALID_GITHUB_URL: 5,
} as const;

const User = {
  /** User cancelled the operation */
  CANCEL_ACTION: 1,
} as const;

const E_CODE_RECORD = {
  File,
  Url,
  User,
};

export default E_CODE_RECORD;
