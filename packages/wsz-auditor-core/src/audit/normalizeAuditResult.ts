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
 * 1. 从package.json 出发, 遍历声明的所有包
 * 2. 对于每一个声明包, 记录其name, 综合漏洞等级, 自身漏洞, 间接漏洞(需要漏洞链条, 漏洞详情, 漏洞等级)
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
        // 包本身问题
        curPkgSelfVuln.push(via[i] as Advisory);
      } else {
        // 上游依赖包问题
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
    const curPath: string[] = [pkgName]; // 记录搜索路径

    for (let i = 0; i < viaPkgs.length; ++i) {
      const viaPkgName = viaPkgs[i];
      if (curPath.includes(viaPkgName)) continue;
      curPath.push(viaPkgName);
      getChainsBacktrack(viaPkgName);
      curPath.pop();
    }

    return chains;

    // 因上游依赖漏洞不一定会导致下游依赖漏洞产生，因此使用effect 字段向上搜索会遇到effect 为空现象，性能较差
    // 这里使用via 字段自顶向下搜索
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
        // 依赖自身漏洞
        for (let i = 0, e = selfProblems.length; i < e; ++i) {
          // TODO: 目前有重复, 但目标不需要去重, 但需要漏洞对象自身
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
 * 处理规范化审计结果元数据
 * @param normalizeAuditResult - 规范化化审查结果
 * @returns 携带元数据的规范审计结果
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
      // 初始化该包在 directPkgsTotalRecord 中的计数器（如果不存在）
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

      // 统计 problems：每个 Advisory 对象自带 severity，按其自身等级归类
      for (const problem of pkg.problems) {
        const problemSeverity = problem.severity as Severity;
        if (SEVERITIES.includes(problemSeverity)) {
          metadata.totalRecord[problemSeverity]++;
          metadata.directPkgsTotalRecord[pkg.name][problemSeverity]++;
        }
      }

      // 统计 childrenProblems：以分组键（childSeverity）为准累加数组长度
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
      // 处理包自身漏洞 problems
      for (const problem of pkg.problems) {
        const problemSeverity = problem.severity as Severity;
        if (SEVERITIES.includes(problemSeverity)) {
          result![problemSeverity].push(problem);
        }
      }
      // 处理间接依赖漏洞 childrenProblems
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
