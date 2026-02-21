import { getAppRootPath } from 'wsz-auditor-shared/node';
import { join } from 'path';

const APP_ROOT_PATH = getAppRootPath();

const TEMP_DIR_PATH = join(APP_ROOT_PATH, '.temp');
const TEST_DIR_PATH = join(APP_ROOT_PATH, 'test');

const TEST_LOCK_FILE_PATH = join(TEST_DIR_PATH, 'package-lock.json');

export { APP_ROOT_PATH, TEMP_DIR_PATH, TEST_LOCK_FILE_PATH };
