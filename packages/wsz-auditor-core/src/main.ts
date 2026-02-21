import './common/env.js';
import { createWorkDir, WORK_BASE_PATH } from './workDir/index.js';
import { parseProject } from './parseProject/index.js';
import { generateLock } from './generateLock/index.js';
import { audit } from './audit/index.js';
import { render } from './render/index.js';
import { createFile, remove } from 'wsz-auditor-shared/node';
import { question, success } from './common/stdio.js';
import Loading from './common/loading.js';
import { TEMP_DIR_PATH } from './common/path.js';
import { join } from 'path';

/**
 * 根据项目根目录，审计项目中所有的包（含项目本身）
 * @param {string} projectPath 项目根目录，可以是本地目录的绝对路径，也可以是远程仓库的URL
 * @param {string} savePath 保存审计结果的文件名，审计结果是一个标准格式的markdown字符串
 */
export async function auditPackage(projectPath: string, savePath: string) {
  // 0. 清空工作目录
  await remove(WORK_BASE_PATH, { recursive: true });
  // 1. 创建工作目录
  const workDir = await createWorkDir();
  // 2. 解析项目，向工作目录添加package.json
  const packageJsonObj = await parseProject(projectPath);
  // 3. 生成lock文件
  await generateLock(workDir, packageJsonObj);
  // 4. 对工作目录进行审计
  const normalizedAuditRes = await audit(workDir, packageJsonObj);
  // 5. 渲染审计结果
  const renderedResult = await render(normalizedAuditRes, packageJsonObj);
  // 6. 保存渲染的审计结果
  if (typeof renderedResult === 'string' && renderedResult) {
    await createFile(renderedResult, savePath);
  }
}

async function main() {
  const inputProjectPath = await question('请输入待审计项目路径: ');

  Loading.start('正在审计中');
  await auditPackage(inputProjectPath, join(TEMP_DIR_PATH, 'result.md'));
  Loading.stop();
  success('审计完成！结果已保存到 result.md\n');
}

main();
