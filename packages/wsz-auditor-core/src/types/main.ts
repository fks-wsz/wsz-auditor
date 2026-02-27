import { NormalizedAuditResult } from '../audit/types/index.js';

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

export type { AuditPackageProcessHooks, AuditPackageOptions };
