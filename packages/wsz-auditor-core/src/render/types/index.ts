import { NormalizedAuditResult, PackageJSON } from '../../audit/types/index.js';

export type RenderData = {
  audit: NormalizedAuditResult;
  desc: RenderDesc;
  packageJsonObj: PackageJSON;
};

export type RenderDesc = {
  severityLevels: {
    low: string;
    moderate: string;
    high: string;
    critical: string;
  };
};
