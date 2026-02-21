import { NormalizedAuditResult, PackageJSON } from '../audit/types/index.js';
import Loading from '../common/loading.js';
import { renderMarkdown } from './markdown.js';
import { RenderData, RenderDesc } from './types/index.js';

const desc: RenderDesc = {
  severityLevels: {
    low: '低危',
    moderate: '中危',
    high: '高危',
    critical: '严重',
  },
};

/**
 * 讲auditResult渲染为markdown格式的字符串
 * @param {object} normalizedAuditRes 规范化的审计结果
 * @param {object} packageJsonObj 包的package.json内容
 */
export async function render(normalizedAuditRes: NormalizedAuditResult, packageJsonObj: PackageJSON) {
  Loading.updateMessage('生成审计报告中');
  const data: RenderData = {
    audit: normalizedAuditRes,
    desc,
    packageJsonObj: packageJsonObj,
  };
  return await renderMarkdown(data);
}
