import { inspect } from 'util';
import { createInterface } from 'readline';

//  ANSI color codes ─
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

//  Timestamp
function timestamp(): string {
  return colorize(new Date().toLocaleTimeString(), 'gray');
}

//  Format any value
function format(value: unknown): string {
  if (typeof value === 'string') return value;
  return inspect(value, { depth: 4, colors: true, compact: false });
}

//  Core print functions

/** Normal information, output to stdout */
export function print(...args: unknown[]): void {
  process.stdout.write(args.map(format).join(' ') + '\n');
}

/** Regular log with timestamp */
export function log(...args: unknown[]): void {
  process.stdout.write(`${timestamp()} ${args.map(format).join(' ')}\n`);
}

/** Success information (green ✔) */
export function success(...args: unknown[]): void {
  const prefix = colorize('✔ success', 'green', true);
  process.stdout.write(`${timestamp()} ${prefix} ${args.map(format).join(' ')}\n`);
}

/** General information (blue ℹ) */
export function info(...args: unknown[]): void {
  const prefix = colorize('ℹ info   ', 'cyan', true);
  process.stdout.write(`${timestamp()} ${prefix} ${args.map(format).join(' ')}\n`);
}

/** Warning information (yellow ⚠), output to stderr */
export function warn(...args: unknown[]): void {
  const prefix = colorize('⚠ warn   ', 'yellow', true);
  process.stderr.write(`${timestamp()} ${prefix} ${args.map(format).join(' ')}\n`);
}

/** Error information (red ✖), output to stderr */
export function error(...args: unknown[]): void {
  const prefix = colorize('✖ error  ', 'red', true);
  process.stderr.write(`${timestamp()} ${prefix} ${args.map(format).join(' ')}\n`);
}

/** Debug information (purple ), only output when DEBUG=1 or DEBUG=true */
export function debug(...args: unknown[]): void {
  if (process.env['DEBUG'] !== '1' && process.env['DEBUG'] !== 'true') return;
  const prefix = colorize(' debug  ', 'magenta', true);
  process.stdout.write(`${DIM}${timestamp()} ${prefix} ${args.map(format).join(' ')}${RESET}\n`);
}

/** Output plain text line (without any prefix), commonly used for CLI result output */
export function println(line = ''): void {
  process.stdout.write(line + '\n');
}

/** Print divider to stderr */
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
      resolve(answer);
    });
  });
}

/**
 * Print Y/n confirmation prompt, returns boolean.
 * Pressing Enter directly defaults to true (Y).
 *
 * @example
 * if (await confirm('Continue?')) { ... }
 */
export async function confirm(prompt: string): Promise<boolean> {
  const answer = await question(`${prompt} ${colorize('[Y/n]', 'cyan')} `);
  return answer.trim() === '' || /^y(es)?$/i.test(answer.trim());
}
