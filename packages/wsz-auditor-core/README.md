# 项目文档

## 1. npm 安全审查逻辑

npmcli 底层调用了各种 nodejs 包来实现各种 cli 功能, 例如 `@npmcli/arborist` 包就是负责依赖树管理和检查的包, 其内部有三种树结构来表示一个项目的依赖关系：

- Ideal Tree 理想依赖树（根据 package.json + semver 算出来的“应该长这样”）
- Actual Tree 真实依赖树（当前 node_modules 里实际装了什么）
- Virtual Tree 虚拟树（仅根据 lockfile 构建，不碰磁盘）

其中依赖之间还构成一个有向图，图中的节点 `Node` 表示依赖，边 `Edge` 表示依赖关系

除了管理依赖之间的关系，还负责检查依赖的漏洞安全等问题，提供了 audit 这套主要的命令.

其安全审查报告的主要数据结构为：

```json
{
  "auditReportVersion": 2, // 报告版本
  "vulnerabilities": {
    // 漏洞
    "body-parser": {
      // 包名
      "name": "body-parser", // 包名
      "severity": "high", // 漏洞等级
      "isDirect": false, // 是否为直接依赖
      "via": [
        // 表示该包漏洞来源，若项为对象，则表示该包自身漏洞，字符串则表示上游依赖存在漏洞
        {
          "source": 1099520,
          "name": "body-parser",
          "dependency": "body-parser",
          "title": "body-parser vulnerable to denial of service when url encoding is enabled", // 标题
          "url": "https://github.com/advisories/GHSA-qwcr-r2fm-qrc7", // github 漏洞报告
          "severity": "high", // 漏洞等级
          "cwe": ["CWE-405"], //
          "cvss": {
            "score": 7.5, //
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H"
          },
          "range": "<1.20.3" // 漏洞影响范围
        },
        "debug",
        "qs"
      ],
      "effects": ["connect"], // 影响哪些下游依赖
      "range": "<=1.20.2", // 影响范围
      "nodes": ["node_modules/body-parser"], // 包所处位置
      "fixAvailable": {
        // 最大影响范围的可修复方案
        "name": "express",
        "version": "5.2.1",
        "isSemVerMajor": true // 需要修改主版本
      }
    }
  },
  "metadata": {
    "vulnerabilities": {
      "info": 0,
      "low": 5,
      "moderate": 1,
      "high": 17,
      "critical": 5,
      "total": 28
    },
    "dependencies": {
      "prod": 98,
      "dev": 0,
      "optional": 0,
      "peer": 0,
      "peerOptional": 0,
      "total": 97
    }
  }
}
```

- auditReportVersion: 报告版本
- vulnerabilities: 漏洞描述
  - name: 包名
  - severity: 漏洞等级
  - isDirect: 是否为直接依赖
  - via: 一个数组，表示该包漏洞来源，若项为对象，则表示该包自身漏洞，字符串则表示上游依赖存在漏洞
    - source: npm 规定的id
    - title: 标题
    - url: github 漏洞数据库地址
    - CVE: 漏洞描述编号 [CVE查询](https://www.cve.org/) [Github查询](https://github.com/advisories)
    - cwe: 通用漏洞分类编号, 属于哪一类漏洞 [CWE查询](https://cwe.mitre.org/)
    - cvss: 漏洞严重等级评分 [CVSS OFFICIAL](https://www.first.org/cvss/)
  - effects: 影响的下游依赖, 可能为空(未被记录/未使用漏洞代码/不可控/不可达)
  - range: 漏洞影响版本范围
  - nodes: 包所处位置
  - fixAvailable: 可修复标志, true 表示可相对安全地修复, false 表示不可修复, 是一个对象时:
    - name: 需要修复的包
    - version: 目标修复包
    - isSemVerMajor: 需要修复主版本
- metadata: 元数据
  - vulnerabilities: 漏洞数量统计
  - dependencies: 依赖数
