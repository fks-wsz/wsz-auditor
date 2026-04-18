import { parseProject } from '../index.js';
import { resolve } from 'path';

// Test local project parsing
async function testLocalProject() {
  const localProjectPath = resolve('../test/local-1');
  try {
    const packageJson = await parseProject(localProjectPath);
    console.log('Local project parsing succeeded:', packageJson);
  } catch (error) {
    console.error('Local project parsing failed:', error);
  }
}

// Test remote project parsing
// async function testRemoteProject() {
//   const remoteProjectUrl = 'https://github.com/webpack/webpack';
//   try {
//     const packageJson = await parseProject(remoteProjectUrl);
//     console.log('Remote project parsing succeeded:', packageJson);
//   } catch (error) {
//     console.error('Remote project parsing failed:', error);
//   }
// }

testLocalProject();
// testRemoteProject();
