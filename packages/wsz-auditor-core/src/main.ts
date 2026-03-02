import './common/env.js';
import { createWorkDir, WORK_BASE_PATH } from './workDir/index.js';
import { parseProject } from './parseProject/index.js';
import { generateLock } from './generateLock/index.js';
import { audit } from './audit/index.js';
import { render } from './render/index.js';
import { createFile, remove, Loading, getAbsolutePath } from 'wsz-auditor-shared/node';
import { assign, isPlainObject, isFunction, hasOwnProperty } from 'wsz-auditor-shared/common';

import type { NormalizedAuditResult } from './audit/types/index.js';
import type { AuditPackageOptions, AuditPackageProcessHooks, InitializeAuditPackageOptions } from './types/main.js';

export type { AuditPackageOptions, AuditPackageProcessHooks, NormalizedAuditResult };

const defaultAuditPackageOptions: AuditPackageOptions = {
  renderReport: null,
  showLoading: false,
};

const hooks: (keyof AuditPackageProcessHooks)[] = ['onInit', 'onParseProject', 'onAudit', 'onRender', 'onFinish'];

async function auditPackage(
  projectPath: string,
  options?: AuditPackageOptions,
  processHooks?: AuditPackageProcessHooks,
): Promise<NormalizedAuditResult>;

async function auditPackage(
  projectPath: string,
  processHooks?: AuditPackageProcessHooks,
): Promise<NormalizedAuditResult>;

/**
 * 根据项目根目录，审计项目中所有的包（含项目本身）
 * @param projectPath 项目根目录，可以是本地目录的绝对路径，也可以是远程仓库的URL
 * @param savePath 保存审计结果的文件名，审计结果是一个标准格式的markdown字符串
 * @param options 选项
 * @param processHooks 审计过程中的回调函数，可以在审计的不同阶段执行一些自定义的逻辑
 */
async function auditPackage(
  projectPath: string,
  optionsOrCallbacks?: AuditPackageOptions | AuditPackageProcessHooks,
  processHooks?: AuditPackageProcessHooks,
) {
  // 参数归一化：当第二个参数是回调而非选项时，进行适配
  const options = initOptions(optionsOrCallbacks);

  if (
    !isPlainObject(processHooks) ||
    hooks.every((hook) => !hasOwnProperty.call(processHooks, hook) || !isFunction(processHooks![hook]))
  ) {
    // 对于无效的processHooks 传参 尝试从options 中获取processHooks
    processHooks = assign({}, options.processHooks);
  }
  options.processHooks = processHooks;

  const showLoading = !!options.showLoading;
  const { onInit, onParseProject, onAudit, onRender, onFinish } = processHooks;

  if (showLoading) Loading.start('初始化审计中');
  if (isFunction(onInit)) {
    onInit();
  }

  // 工作目录准备
  await remove(WORK_BASE_PATH, { recursive: true });
  const workDir = await createWorkDir();

  // 解析项目，向工作目录添加package.json
  if (showLoading) Loading.updateMessage('正在解析项目依赖树');
  if (isFunction(onParseProject)) {
    onParseProject();
  }
  const packageJsonObj = await parseProject(projectPath);

  // 生成lock文件
  await generateLock(workDir, packageJsonObj);

  // 对工作目录进行审计
  if (showLoading) Loading.updateMessage('正在审计中');
  if (isFunction(onAudit)) {
    onAudit();
  }
  const normalizedAuditRes = await audit(workDir, packageJsonObj);

  const renderReport = options.renderReport;
  if (isPlainObject(renderReport)) {
    const reportPath = getAbsolutePath(renderReport.path);
    // 渲染审计结果
    if (showLoading) Loading.updateMessage('渲染审计结果中');
    if (isFunction(onRender)) {
      onRender();
    }
    const renderedResult = await render(normalizedAuditRes, packageJsonObj);
    // 保存渲染的审计结果
    if (typeof renderedResult === 'string' && renderedResult) {
      await createFile(renderedResult, reportPath);
    }
  }

  // 结束
  if (showLoading) Loading.stop();
  if (isFunction(onFinish)) {
    onFinish(normalizedAuditRes);
  }
  return normalizedAuditRes;
}

function initOptions(inputOptions?: AuditPackageOptions | AuditPackageProcessHooks): InitializeAuditPackageOptions {
  let options: InitializeAuditPackageOptions | null = null;
  let processHooks: AuditPackageProcessHooks | null = null;

  if (
    isPlainObject(inputOptions) &&
    hooks.some((hook) => hasOwnProperty.call(inputOptions, hook) && (inputOptions as AuditPackageProcessHooks)[hook])
  ) {
    // 第二个参数是 processHooks
    processHooks = inputOptions as AuditPackageProcessHooks;
  } else {
    options = inputOptions as AuditPackageOptions | null;
  }

  options = assign({}, defaultAuditPackageOptions, options);
  options.processHooks = processHooks;

  return options;
}

export { auditPackage };
