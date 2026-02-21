import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec); // 将 exec 转换为返回 Promise 的函数

async function runCommand(cmd: string, cwd: string) {
  try {
    const stdout = await execAsync(cmd, {
      cwd,
      encoding: 'utf-8',
    });
    // 返回 audit 的 JSON 结果
    return stdout.stdout.toString();
  } catch (err) {
    if (err && typeof err === 'object') {
      if ((err as any).stdout) {
        return (err as any).stdout.toString();
      }
    }
    throw err;
  }
}

export { runCommand };
