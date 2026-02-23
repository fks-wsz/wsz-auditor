import { getAppRootPath } from 'wsz-auditor-shared/node';
import { join } from 'path';

const APP_ROOT_PATH = getAppRootPath();
const PUBLIC_PATH = join(APP_ROOT_PATH, './public');
const DIST_PATH = join(APP_ROOT_PATH, './dist');
const TEMP_PATH = join(APP_ROOT_PATH, './.temp');

export { APP_ROOT_PATH, PUBLIC_PATH, DIST_PATH, TEMP_PATH };
