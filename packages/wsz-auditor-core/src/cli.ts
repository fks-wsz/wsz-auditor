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
Usage: audit [Options]

Options:
  --report-dir <path>  Specify the audit report output directory (default: project root directory)
  --report-name <name> Specify the audit report file name (default: audit-report)
  --loading            Show loading animation during audit process
  -h, --help           Show help information
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
      const shouldCover = await confirm(
        `Specified report output directory ${userReportPath} already exists, whether to overwrite？`,
      );
      if (shouldCover) {
        await remove(userReportPath, { recursive: true });
        info(`${userReportPath} deleted...`);
      } else {
        throw new BaseError(
          'User',
          'CANCEL_ACTION',
          `The user cancels overwriting ${userReportPath}, please re-specify the report output directory`,
        );
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
  // Parse command line arguments
  const args = process.argv.slice(2);

  if (args.includes('-h') || args.includes('--help')) {
    showHelp();
    process.exit(0);
  }

  const userProjectPath = await question('Please enter the path of the project to be audited: ');
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

  success(`Audit results have been saved to ${reportPath} `);
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
