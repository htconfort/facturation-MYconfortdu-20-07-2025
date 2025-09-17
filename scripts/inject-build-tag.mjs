import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const file = resolve(__dirname, '../dist/index.html');
const html = readFileSync(file, 'utf8');

const tag = `${(process.env.COMMIT_REF || process.env.VERCEL_GIT_COMMIT_SHA || '').slice(0,7) || 'local'} @ ${new Date().toISOString()}`;
const out = html.replace('<!--BUILD_TAG-->', tag);

writeFileSync(file, out);
console.log('Injected BUILD_TAG:', tag);
