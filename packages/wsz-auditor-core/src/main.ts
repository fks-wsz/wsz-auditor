import './common/env.js';
import { createWorkDir, WORK_BASE_PATH } from './workDir/index.js';
import { parseProject } from './parseProject/index.js';
import { generateLock } from './generateLock/index.js';
import { audit } from './audit/index.js';
import { render } from './render/index.js';
import { createFile, remove, Loading, getAbsolutePath } from 'wsz-auditor-shared/node';
import { assign, isPlainObject, isFunction } from 'wsz-auditor-shared/common';
import { question, success } from './common/stdio.js';
import { TEMP_DIR_PATH } from './common/path.js';
import { join } from 'path';
import { NormalizedAuditResult } from './audit/types/index.js';

interface AuditPackageProcessHooks {
  onInit?: () => void;
  onParseProject?: () => void;
  onAudit?: () => void;
  onRender?: () => void;
  onFinish?: (normalizedAuditResult: NormalizedAuditResult) => void;
}

interface AuditPackageOptions {
  renderReport: {
    path: string;
  } | null;
  showLoading: boolean;
}

const defaultAuditPackageOptions: AuditPackageOptions = {
  renderReport: null,
  showLoading: false,
};

async function auditPackage(
  projectPath: string,
  options?: AuditPackageOptions,
  processCallbacks?: AuditPackageProcessHooks,
): Promise<NormalizedAuditResult>;

async function auditPackage(
  projectPath: string,
  processCallbacks?: AuditPackageProcessHooks,
): Promise<NormalizedAuditResult>;

/**
 * 根据项目根目录，审计项目中所有的包（含项目本身）
 * @param projectPath 项目根目录，可以是本地目录的绝对路径，也可以是远程仓库的URL
 * @param savePath 保存审计结果的文件名，审计结果是一个标准格式的markdown字符串
 * @param options 选项
 * @param processCallbacks 审计过程中的回调函数，可以在审计的不同阶段执行一些自定义的逻辑
 */
async function auditPackage(
  projectPath: string,
  optionsOrCallbacks?: AuditPackageOptions | AuditPackageProcessHooks,
  processCallbacks?: AuditPackageProcessHooks,
) {
  // 参数归一化：当第二个参数是回调而非选项时，进行适配
  let options: AuditPackageOptions | undefined;
  if (
    isPlainObject(optionsOrCallbacks) &&
    ('onInit' in optionsOrCallbacks ||
      'onParseProject' in optionsOrCallbacks ||
      'onAudit' in optionsOrCallbacks ||
      'onRender' in optionsOrCallbacks ||
      'onFinish' in optionsOrCallbacks)
  ) {
    // 第二个参数是 processCallbacks
    processCallbacks = optionsOrCallbacks as AuditPackageProcessHooks;
    options = defaultAuditPackageOptions;
  } else {
    options = optionsOrCallbacks as AuditPackageOptions | undefined;
  }

  // 初始化
  if (isPlainObject(options)) {
    options = assign(options, defaultAuditPackageOptions);
  } else {
    options = defaultAuditPackageOptions;
  }
  const showLoading = !!options.showLoading;
  const { onInit, onParseProject, onAudit, onRender, onFinish } = processCallbacks || {};

  showLoading && Loading.start('初始化审计中');
  if (isFunction(onInit)) {
    onInit();
  }

  // 工作目录准备
  await remove(WORK_BASE_PATH, { recursive: true });
  const workDir = await createWorkDir();

  // 解析项目，向工作目录添加package.json
  showLoading && Loading.updateMessage('正在解析项目依赖树');
  if (isFunction(onParseProject)) {
    onParseProject();
  }
  const packageJsonObj = await parseProject(projectPath);

  // 生成lock文件
  await generateLock(workDir, packageJsonObj);

  // 对工作目录进行审计
  showLoading && Loading.updateMessage('正在审计中');
  if (isFunction(onAudit)) {
    onAudit();
  }
  const normalizedAuditRes = await audit(workDir, packageJsonObj);

  const renderReport = options.renderReport;
  if (isPlainObject(renderReport)) {
    const reportPath = getAbsolutePath(renderReport.path);
    // 渲染审计结果
    showLoading && Loading.updateMessage('渲染审计结果中');
    if (isFunction(onRender)) {
      onRender();
    }
    const renderedResult = await render(normalizedAuditRes, packageJsonObj);
    // 保存渲染的审计结果
    if (typeof renderedResult === 'string' && renderedResult) {
      await createFile(renderedResult, reportPath);
    }
    success('审计完成！结果已保存到 ' + reportPath);
  }

  // 结束
  showLoading && Loading.stop();
  if (isFunction(onFinish)) {
    onFinish(normalizedAuditRes);
  }
  return normalizedAuditRes;
}

async function auditPackageForCli() {
  const inputProjectPath = await question('请输入待审计项目路径: ');

  await auditPackage(inputProjectPath, {
    renderReport: {
      path: join(TEMP_DIR_PATH, 'result.md'),
    },
    showLoading: true,
  });

  success('审计完成！结果已保存到 result.md\n');
}

export { auditPackage, auditPackageForCli };
