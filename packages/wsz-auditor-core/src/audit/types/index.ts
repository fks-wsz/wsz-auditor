import type { Advisory, AuditReport, VulnJson } from '@npmcli/arborist';

/** @description package.json */
export interface PackageJSON {
  name: string;
  version: string;
  description?: string;
  main?: string;
  module?: string;
  types?: string;
  typings?: string;
  bin?: string | Record<string, string>;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  engines?: {
    node?: string;
    npm?: string;
  };
  // Modern package commonly used export fields
  exports?: string | Record<string, string | Record<string, string>>;
}

/** @description npm audit json */
export type NpmAuditJSON = ReturnType<AuditReport['toJSON']>;

/** Vulnerability severity level */
export type Severity = 'low' | 'moderate' | 'high' | 'critical';

/** npm audit vulnerability via */
export type VulnVia = (string | Advisory)[];

/** Vulnerability object after supplementing information */
export type AdvancedVulnJson = Omit<VulnJson, 'via'> & { via: VulnVia };

export interface AdvisoryWithChain {
  chain: string[];
  problem: Advisory;
}

/** @description Normalized vulnerability package information */
export interface NormalizedPackageInfo {
  name: string;
  problems: Advisory[];
  severity?: string;
  nodes?: string[];
  childrenProblems?: Record<Severity, Array<AdvisoryWithChain>>;
  childrenPkg?: string[];
}

/** @description Normalized audit result */
export interface NormalizedAuditResult {
  vulnerabilities: Record<string, NormalizedPackageInfo[]>;
  // summary?: {
  //   total: number;
  //   critical: number;
  //   high: number;
  //   moderate: number;
  //   low: number;
  // };
  metadata?: {
    totalRecord: Record<Severity | 'total', number>;
    directPkgsTotalRecord: Record<string, Record<Severity, number>>;
    depChainTotalRecord: Record<string, Record<Severity, number>>;
  };
  vulnSortBySeverity?: Record<Severity, (AdvisoryWithChain | Advisory)[]>;
}
