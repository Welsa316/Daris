import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');

console.log('Installing frontend dependencies...');
execSync('npm install --include=dev', { cwd: rootDir, stdio: 'inherit' });

console.log('Building frontend...');
execSync('npx vite build', { cwd: rootDir, stdio: 'inherit' });

console.log('Frontend build complete.');
