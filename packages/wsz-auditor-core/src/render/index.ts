import { NormalizedAuditResult, PackageJSON } from '../audit/types/index.js';
import { renderMarkdown } from './markdown.js';
import { RenderData, RenderDesc } from './types/index.js';

const desc: RenderDesc = {
  severityLevels: {
    low: 'Low',
    moderate: 'Moderate',
    high: 'High',
    critical: 'Critical',
  },
};

/**
 * Render auditResult as markdown string
 * @param {object} normalizedAuditRes Normalized audit result
 * @param {object} packageJsonObj Package package.json content
 */
export async function render(normalizedAuditRes: NormalizedAuditResult, packageJsonObj: PackageJSON) {
  const data: RenderData = {
    audit: normalizedAuditRes,
    desc,
    packageJsonObj: packageJsonObj,
  };
  return await renderMarkdown(data);
}
