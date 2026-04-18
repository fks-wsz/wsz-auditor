import { npmAudit } from './npmAudit.js';
import { normalizeAuditResult } from './normalizeAuditResult.js';
// import { currentAudit } from './currentAudit.js';
import type { PackageJSON } from './types/index.js';
import { join } from 'path';
import { createJsonFile } from 'wsz-auditor-shared/node';

/**
 * Audit project
 * @param workDir Working directory
 * @param packageJson package.json object
 * @returns
 */
export async function audit(workDir: string, packageJson: PackageJSON) {
  // Call npm audit to get audit results
  const auditResult = await npmAudit(workDir);
  await createJsonFile(join(workDir, 'audit.json'), auditResult);
  // Normalize audit results
  const normalizedResult = normalizeAuditResult(auditResult, packageJson);
  await createJsonFile(join(workDir, 'normalized-audit.json'), normalizedResult);

  // // Add audit results for the current project
  // const current = await currentAudit(packageJson.name, packageJson.version);
  // if (current) {
  //   normalizedResult.vulnerabilities[current.severity].unshift(current);
  // }

  // Add summary information
  // normalizedResult.summary = {
  //   total: Object.values(normalizedResult.vulnerabilities).reduce((sum, arr) => sum + arr.length, 0),
  //   critical: normalizedResult.vulnerabilities.critical.length,
  //   high: normalizedResult.vulnerabilities.high.length,
  //   moderate: normalizedResult.vulnerabilities.moderate.length,
  //   low: normalizedResult.vulnerabilities.low.length,
  // };
  return normalizedResult;
}
