import { join } from 'path';
import { uniqueId } from 'wsz-auditor-shared/common';
import { createDir } from 'wsz-auditor-shared/node';
import Loading from '../common/loading.js';
import { TEMP_DIR_PATH } from '../common/path.js';

const WORK_BASE_PATH = join(TEMP_DIR_PATH, 'work');

async function createWorkDir() {
  Loading.updateMessage('生成工作目录');
  const workDir = join(WORK_BASE_PATH, uniqueId());
  await createDir(workDir, { recursive: true });
  return workDir;
}

export { WORK_BASE_PATH, createWorkDir };
