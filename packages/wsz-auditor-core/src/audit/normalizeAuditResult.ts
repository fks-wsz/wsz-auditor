// import { getDepChains } from './getDepChain.js';
import { hasOwnProperty } from 'wsz-auditor-shared/common';
import type {
  NormalizedAuditResult,
  NormalizedPackageInfo,
  NpmAuditJSON,
  PackageJSON,
  AdvancedVulnJson,
  Severity,
} from './types/index.js';
import type { Advisory } from '@npmcli/arborist';

const SEVERITIES: Severity[] = ['critical', 'high', 'moderate', 'low'];

/**
 * @todo
 * 1. Start from package.json, traverse all declared packages
 * 2. For each declared package, record its name, comprehensive vulnerability level, own vulnerabilities, indirect vulnerabilities (need vulnerability chain, vulnerability details, vulnerability level)
 */

function _normalizeVulnerabilities(auditResult: NpmAuditJSON, packageJson: PackageJSON) {
  const result: Record<string, NormalizedPackageInfo[]> = {
    critical: [],
    high: [],
    moderate: [],
    low: [],
  };
  const prodPackageNames = Object.keys(packageJson.dependencies || {});
  const devPackageNames = Object.keys(packageJson.devDependencies || {});
  const packageNames = [...prodPackageNames, ...devPackageNames];

  for (const pkg of packageNames) {
    if (hasOwnProperty.call(auditResult.vulnerabilities, pkg)) {
      const pkgVuln = auditResult.vulnerabilities[pkg];
      const normalizedPkgVuln = _normalizePkgVuln(pkgVuln);
      if (normalizedPkgVuln && normalizedPkgVuln.severity) {
        result[normalizedPkgVuln.severity].push(normalizedPkgVuln);
      }
    }
  }

  return result;

  function _normalizePkgVuln(pkgVuln: AdvancedVulnJson) {
    const { via = [] } = pkgVuln;

    const curPkgSelfVuln: Advisory[] = [];
    const curPkgViaPkg: string[] = [];

    for (let i = 0, e = via.length; i < e; ++i) {
      if (typeof via[i] === 'object') {
        // Package's own issues
        curPkgSelfVuln.push(via[i] as Advisory);
      } else {
        // Upstream dependency package issues
        curPkgViaPkg.push(via[i] as string);
      }
    }

    const info: NormalizedPackageInfo = {
      name: pkgVuln.name,
      severity: pkgVuln.severity,
      problems: curPkgSelfVuln,
      nodes: pkgVuln.nodes || [],
      childrenPkg: curPkgViaPkg,
      childrenProblems: getChildrenProblems(pkgVuln.name, curPkgViaPkg),
    };

    return info;
  }

  function getChildrenProblems(pkgName: string, viaPkgs: string[]) {
    const chains: NormalizedPackageInfo['childrenProblems'] = {
      critical: [],
      high: [],
      moderate: [],
      low: [],
    };
    const curPath: string[] = [pkgName]; // Track search path

    for (let i = 0; i < viaPkgs.length; ++i) {
      const viaPkgName = viaPkgs[i];
      if (curPath.includes(viaPkgName)) continue;
      curPath.push(viaPkgName);
      getChainsBacktrack(viaPkgName);
      curPath.pop();
    }

    return chains;

    /**
     * Searching upward with the effect field encounters empty effect phenomenon, see issue and npm/cli source code
     * Here we use via field for top-down search
     * @see https://github.com/npm/cli/issues/4366
     * @param pkg
     */
    function getChainsBacktrack(pkg: string) {
      const targetVuln = auditResult.vulnerabilities[pkg];
      const via = targetVuln.via;

      const viaPkgs: string[] = [];
      const selfProblems: Advisory[] = [];
      for (let i = 0, e = via.length; i < e; ++i) {
        if (typeof via[i] === 'object') {
          selfProblems.push(via[i]);
        } else {
          viaPkgs.push(via[i] as unknown as string);
        }
      }

      if (selfProblems.length) {
        // Dependency's own vulnerability
        for (let i = 0, e = selfProblems.length; i < e; ++i) {
          // TODO: There are duplicates currently, but the target doesn't need deduplication, just need the vulnerability object itself
          const vulnSeverity = selfProblems[i].severity as Severity;
          if (SEVERITIES.includes(vulnSeverity)) {
            (chains![vulnSeverity] ??= []).push({
              chain: [...curPath],
              problem: selfProblems[i],
            });
          }
        }
      }

      for (const nextChildPkg of viaPkgs) {
        if (curPath.includes(nextChildPkg)) continue;
        curPath.push(nextChildPkg);
        getChainsBacktrack(nextChildPkg);
        curPath.pop();
      }
    }
  }
}

/**
 * Process normalized audit result metadata
 * @param normalizeAuditResult - Normalized audit result
 * @returns Normalized audit result with metadata
 */
function calculateMetadata(normalizedAuditResult: NormalizedAuditResult): NormalizedAuditResult['metadata'] {
  const vulnerabilities = normalizedAuditResult.vulnerabilities;
  const metadata: NormalizedAuditResult['metadata'] = {
    totalRecord: {
      critical: 0,
      high: 0,
      moderate: 0,
      low: 0,
      total: 0,
    },
    directPkgsTotalRecord: {},
    depChainTotalRecord: {},
  };

  for (const severity of SEVERITIES) {
    const pkgList = vulnerabilities[severity] ?? [];

    for (const pkg of pkgList) {
      // Initialize counter for this package in directPkgsTotalRecord (if it doesn't exist)
      if (!metadata.directPkgsTotalRecord[pkg.name]) {
        metadata.directPkgsTotalRecord[pkg.name] = {
          critical: 0,
          high: 0,
          moderate: 0,
          low: 0,
        };
        metadata.depChainTotalRecord[pkg.name] = {
          critical: 0,
          high: 0,
          moderate: 0,
          low: 0,
        };
      }

      // Count problems: each Advisory object has its own severity, categorize by its own level
      for (const problem of pkg.problems) {
        const problemSeverity = problem.severity as Severity;
        if (SEVERITIES.includes(problemSeverity)) {
          metadata.totalRecord[problemSeverity]++;
          metadata.directPkgsTotalRecord[pkg.name][problemSeverity]++;
        }
      }

      // Count childrenProblems: accumulate array length grouped by childSeverity
      if (pkg.childrenProblems) {
        for (const childSeverity of SEVERITIES) {
          const count = pkg.childrenProblems[childSeverity]?.length ?? 0;
          metadata.totalRecord[childSeverity] += count;
          metadata.depChainTotalRecord[pkg.name][childSeverity] += count;
        }
      }
    }
  }

  metadata.totalRecord.total = SEVERITIES.reduce((pre, cur) => {
    return pre + metadata.totalRecord[cur];
  }, 0);

  return (normalizedAuditResult.metadata = metadata);
}

function resolveVulnerabilitiesBySeverity(
  normalizedAuditResult: NormalizedAuditResult,
): NormalizedAuditResult['vulnSortBySeverity'] {
  const result = {} as NormalizedAuditResult['vulnSortBySeverity'];
  for (const severity of SEVERITIES) {
    result![severity] = [];
  }

  const vulnerabilities = normalizedAuditResult.vulnerabilities;

  for (const severity of SEVERITIES) {
    const pkgList = vulnerabilities[severity] ?? [];
    for (const pkg of pkgList) {
      // Handle package's own vulnerability problems
      for (const problem of pkg.problems) {
        const problemSeverity = problem.severity as Severity;
        if (SEVERITIES.includes(problemSeverity)) {
          result![problemSeverity].push(problem);
        }
      }
      // Handle indirect dependency vulnerability childrenProblems
      if (pkg.childrenProblems) {
        for (const childSeverity of SEVERITIES) {
          const problems = pkg.childrenProblems[childSeverity] ?? [];
          for (const problem of problems) {
            result![childSeverity].push(problem);
          }
        }
      }
    }
  }

  return (normalizedAuditResult.vulnSortBySeverity = result);
}

export function normalizeAuditResult(auditResult: NpmAuditJSON, packageJson: PackageJSON): NormalizedAuditResult {
  const normalizedAuditResult: NormalizedAuditResult = {
    vulnerabilities: {},
  };

  normalizedAuditResult.vulnerabilities = _normalizeVulnerabilities(auditResult, packageJson);

  calculateMetadata(normalizedAuditResult);
  resolveVulnerabilitiesBySeverity(normalizedAuditResult);

  return normalizedAuditResult;
}
