import { runCommand } from 'wsz-auditor-shared/node';
import { NpmAuditJSON } from './types/index.js';

export async function npmAudit(workDir: string) {
  const cmd = `npm audit --json`;
  const jsonResult = await runCommand(cmd, workDir); // 在工作目录中执行命令
  const auditData: NpmAuditJSON = JSON.parse(jsonResult);
  return auditData;
}
