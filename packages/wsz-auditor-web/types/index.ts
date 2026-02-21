// Re-export types from parent audit module
export type {
  PackageJSON,
  NormalizedAuditResult,
  NormalizedPackageInfo,
  NpmAuditJSON,
} from '../../src/audit/types/index';

// Additional types for web application
export interface ServerContext {
  url: string;
  title: string;
  state: {
    auditResult: any;
    packageInfo: any;
  };
}
