import { inspect } from 'util';
import { createInterface } from 'readline';

//  ANSI 颜色码 ─
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';

const FG: Record<string, string> = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
};

function colorize(text: string, color: keyof typeof FG, bold = false): string {
  return `${bold ? BOLD : ''}${FG[color] ?? ''}${text}${RESET}`;
}

//  时间戳
function timestamp(): string {
  return colorize(new Date().toLocaleTimeString(), 'gray');
}

//  格式化任意值
function format(value: unknown): string {
  if (typeof value === 'string') return value;
  return inspect(value, { depth: 4, colors: true, compact: false });
}

//  核心打印函数

/** 普通信息，输出到 stdout */
export function print(...args: unknown[]): void {
  process.stdout.write(args.map(format).join(' ') + '\n');
}

/** 带时间戳的普通日志 */
export function log(...args: unknown[]): void {
  process.stdout.write(`${timestamp()} ${args.map(format).join(' ')}\n`);
}

/** 成功信息（绿色 ✔） */
export function success(...args: unknown[]): void {
  const prefix = colorize('✔ success', 'green', true);
  process.stdout.write(`${timestamp()} ${prefix} ${args.map(format).join(' ')}\n`);
}

/** 普通提示信息（蓝色 ℹ） */
export function info(...args: unknown[]): void {
  const prefix = colorize('ℹ info   ', 'cyan', true);
  process.stdout.write(`${timestamp()} ${prefix} ${args.map(format).join(' ')}\n`);
}

/** 警告信息（黄色 ⚠），输出到 stderr */
export function warn(...args: unknown[]): void {
  const prefix = colorize('⚠ warn   ', 'yellow', true);
  process.stderr.write(`${timestamp()} ${prefix} ${args.map(format).join(' ')}\n`);
}

/** 错误信息（红色 ✖），输出到 stderr */
export function error(...args: unknown[]): void {
  const prefix = colorize('✖ error  ', 'red', true);
  process.stderr.write(`${timestamp()} ${prefix} ${args.map(format).join(' ')}\n`);
}

/** 调试信息（紫色 ），仅在 DEBUG=1 或 DEBUG=true 时输出 */
export function debug(...args: unknown[]): void {
  if (process.env['DEBUG'] !== '1' && process.env['DEBUG'] !== 'true') return;
  const prefix = colorize(' debug  ', 'magenta', true);
  process.stdout.write(`${DIM}${timestamp()} ${prefix} ${args.map(format).join(' ')}${RESET}\n`);
}

/** 输出纯文本行（不带任何前缀），常用于 CLI 结果输出 */
export function println(line = ''): void {
  process.stdout.write(line + '\n');
}

/** 打印分隔线到 stderr */
export function divider(char = '', width = 60): void {
  process.stderr.write(colorize(char.repeat(width), 'gray') + '\n');
}

export function question(prompt: string): Promise<string> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      process.stdin.unref();
      resolve(answer);
    });
  });
}

/**
 * 打印 Y/n 确认提示，返回布尔值。
 * 直接回车默认为 true（Y）。
 *
 * @example
 * if (await confirm('是否继续？')) { ... }
 */
export async function confirm(prompt: string): Promise<boolean> {
  const answer = await question(`${prompt} ${colorize('[Y/n]', 'cyan')} `);
  return answer.trim() === '' || /^y(es)?$/i.test(answer.trim());
}
