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
 * Audit all packages in the project based on the project root directory (including the project itself)
 * @param projectPath Project root directory, can be absolute path of local directory or URL of remote repository
 * @param savePath File name to save audit result, audit result is a standard markdown string
 * @param options Options
 * @param processHooks Callback functions during the audit process, can execute custom logic at different stages of the audit
 */
async function auditPackage(
  projectPath: string,
  optionsOrCallbacks?: AuditPackageOptions | AuditPackageProcessHooks,
  processHooks?: AuditPackageProcessHooks,
) {
  // Parameter normalization: adapt when the second parameter is a callback instead of options
  const options = initOptions(optionsOrCallbacks);

  if (
    !isPlainObject(processHooks) ||
    hooks.every((hook) => !hasOwnProperty.call(processHooks, hook) || !isFunction(processHooks![hook]))
  ) {
    // For invalid processHooks parameter, try to get processHooks from options
    processHooks = assign({}, options.processHooks);
  }
  options.processHooks = processHooks;

  const showLoading = !!options.showLoading;
  const { onInit, onParseProject, onAudit, onRender, onFinish } = processHooks;

  if (showLoading) Loading.start('Initializing audit');
  if (isFunction(onInit)) {
    onInit();
  }

  // Working directory preparation
  await remove(WORK_BASE_PATH, { recursive: true });
  const workDir = await createWorkDir();

  // Resolve project, add package.json to working directory
  if (showLoading) Loading.updateMessage('Resolving project dependency tree');
  if (isFunction(onParseProject)) {
    onParseProject();
  }
  const packageJsonObj = await parseProject(projectPath);

  // Generate lock file
  await generateLock(workDir, packageJsonObj);

  // Audit the working directory
  if (showLoading) Loading.updateMessage('Under audit');
  if (isFunction(onAudit)) {
    onAudit();
  }
  const normalizedAuditRes = await audit(workDir, packageJsonObj);

  const renderReport = options.renderReport;
  if (isPlainObject(renderReport)) {
    const reportPath = getAbsolutePath(renderReport.path);
    // Render audit results
    if (showLoading) Loading.updateMessage('Rendering audit results');
    if (isFunction(onRender)) {
      onRender();
    }
    const renderedResult = await render(normalizedAuditRes, packageJsonObj);
    // Save rendered audit results
    if (typeof renderedResult === 'string' && renderedResult) {
      await createFile(renderedResult, reportPath);
    }
  }

  // Finish
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
    // Second parameter is processHooks
    processHooks = inputOptions as AuditPackageProcessHooks;
  } else {
    options = inputOptions as AuditPackageOptions | null;
  }

  options = assign({}, defaultAuditPackageOptions, options);
  options.processHooks = processHooks;

  return options;
}

export { auditPackage };
