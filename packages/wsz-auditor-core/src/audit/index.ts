import { npmAudit } from './npmAudit.js';
import { normalizeAuditResult } from './normalizeAuditResult.js';
// import { currentAudit } from './currentAudit.js';
import type { PackageJSON } from './types/index.js';
import { join } from 'path';
import { createJsonFile } from 'wsz-auditor-shared/node';

/**
 * 审计项目
 * @param workDir 工作目录
 * @param packageJson package.json 对象
 * @returns
 */
export async function audit(workDir: string, packageJson: PackageJSON) {
  // 调用 npm audit 获取审计结果
  const auditResult = await npmAudit(workDir);
  await createJsonFile(join(workDir, 'audit.json'), auditResult);
  // 规范化审计结果
  const normalizedResult = normalizeAuditResult(auditResult, packageJson);
  await createJsonFile(join(workDir, 'normalized-audit.json'), normalizedResult);

  // // 添加当前工程的审计结果
  // const current = await currentAudit(packageJson.name, packageJson.version);
  // if (current) {
  //   normalizedResult.vulnerabilities[current.severity].unshift(current);
  // }

  // 添加汇总信息
  // normalizedResult.summary = {
  //   total: Object.values(normalizedResult.vulnerabilities).reduce((sum, arr) => sum + arr.length, 0),
  //   critical: normalizedResult.vulnerabilities.critical.length,
  //   high: normalizedResult.vulnerabilities.high.length,
  //   moderate: normalizedResult.vulnerabilities.moderate.length,
  //   low: normalizedResult.vulnerabilities.low.length,
  // };
  return normalizedResult;
}
