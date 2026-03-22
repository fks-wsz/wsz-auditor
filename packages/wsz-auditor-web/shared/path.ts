import { join } from 'path';
import { getAbsolutePath } from 'wsz-auditor-shared';

const APP_ROOT_PATH = getAbsolutePath('./');
const PUBLIC_PATH = join(APP_ROOT_PATH, './public');
const DIST_PATH = join(APP_ROOT_PATH, './dist');
const TEMP_PATH = join(APP_ROOT_PATH, './.temp');

export { APP_ROOT_PATH, PUBLIC_PATH, DIST_PATH, TEMP_PATH };
