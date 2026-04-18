import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec); // Convert exec to a function that returns Promise

async function runCommand(cmd: string, cwd?: string) {
  try {
    const stdout = await execAsync(cmd, {
      cwd,
      encoding: 'utf-8',
    });
    // Return JSON result of audit
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
