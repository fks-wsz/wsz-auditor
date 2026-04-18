import { render } from '../index.js';
import { getDirname } from '../../common/utils.js';
import { join } from 'path';
import fs from 'fs';

const workDir = join(getDirname(import.meta.url), './workdir');
const auditResultJson = join(workDir, './auditResult.json');
const indexJson = join(workDir, './index.md');
const packageJsonPath = join(workDir, './package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const auditResult = JSON.parse(fs.readFileSync(auditResultJson, 'utf8'));
const templatePath = join(getDirname(import.meta.url), '../template/index.ejs');
async function test() {
  const result = await render(auditResult, packageJson);
  fs.writeFileSync(indexJson, result, 'utf8');
  console.log('ok');
}

// Watch for file changes
fs.watch(templatePath, (eventType) => {
  if (eventType === 'change') {
    console.log(`Template file has changed, re-running test function`);
    test(); // Trigger function
  }
});

console.log(`Started watching file: ${templatePath}`);
