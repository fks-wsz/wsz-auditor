#!/usr/bin/env node
import { auditPackage } from './main.js';
import { question, success, error, info, confirm } from './common/stdio.js';
import { BaseError, getAbsolutePath, getAppRootPath, isExist, remove } from 'wsz-auditor-shared';
import { join } from 'path';

interface UserArgs {
  userProjectPath: string;
  userReportDir: string;
  userShowLoading: boolean;
  userReportName: string;
}

const DEFAULT_REPORT_NAME = 'audit-report';

function showHelp() {
  console.log(`
用法: audit [选项]

选项:
  --report-dir <path>  指定审计报告输出目录 (默认: 项目根目录)
  --report-name <name> 指定审计报告文件名 (默认: audit-report)
  --loading            审计过程中显示加载动画
  -h, --help           显示帮助信息
`);
}

function getArgValueFromArgv(argv: string[], key: string, defaultValue: string = ''): string {
  const index = argv.indexOf(key);
  if (index !== -1 && argv[index + 1]) {
    return argv[index + 1];
  }
  return defaultValue;
}

function hasSymbolFromArgv(argv: string[], symbol: string): boolean {
  return argv.includes(symbol);
}

async function preCheck({ args }: { args: UserArgs }) {
  const { userReportDir, userReportName } = args;

  if (userReportDir) {
    const userReportPath = getAbsolutePath(join(userReportDir, (userReportName || DEFAULT_REPORT_NAME) + '.md'));

    if (isExist(userReportPath)) {
      const shouldCover = await confirm(`指定的报告输出目录 ${userReportPath} 已存在，是否覆盖？`);
      if (shouldCover) {
        await remove(userReportPath, { recursive: true });
        info(`已删除 ${userReportPath}...`);
      } else {
        throw new BaseError('User', 'CANCEL_ACTION', `用户取消覆盖 ${userReportPath}，请重新指定报告输出目录`);
      }
    }
  }
}

function resolveArgs(args: UserArgs) {
  const { userReportDir, userReportName, userShowLoading } = args;

  const reportDir = userReportDir || getAppRootPath();
  const reportName = userReportName || DEFAULT_REPORT_NAME;
  const reportPath = getAbsolutePath(join(reportDir, `${reportName}.md`));

  const showLoading = !!userShowLoading || true;

  return {
    reportPath,
    showLoading,
  };
}

async function auditPackageForCli() {
  // 解析命令行参数
  const args = process.argv.slice(2);

  if (args.includes('-h') || args.includes('--help')) {
    showHelp();
    process.exit(0);
  }

  const userProjectPath = await question('请输入待审计项目路径: ');
  const userReportDir = getArgValueFromArgv(args, '--report-dir');
  const userShowLoading = hasSymbolFromArgv(args, '--loading');
  const userReportName = getArgValueFromArgv(args, '--report-name');

  const userArgs: UserArgs = {
    userProjectPath,
    userReportDir,
    userShowLoading,
    userReportName,
  };

  await preCheck({
    args: userArgs,
  });

  const { reportPath, showLoading } = resolveArgs(userArgs);

  await auditPackage(userProjectPath, {
    renderReport: {
      path: reportPath,
    },
    showLoading,
  });

  success(`审计结果已保存到 ${reportPath} 中`);
  process.stdin.destroy();
}

auditPackageForCli().catch((err: unknown) => {
  if (err instanceof BaseError) {
    error(err.getFormattedMessage());
  } else {
    error((err as Error).message);
  }

  if (__DEV__) {
    if (err instanceof Error) {
      console.log(err.stack);
    }
  }
  process.stdin.destroy();
  process.exit(1);
});
