#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

function run(cmd, args) {
  const result = spawnSync(cmd, args, { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run('npx', ['vitest', 'run']);
run('npx', ['tsc', '--noEmit']);

const envExample = readFileSync('deploy/env.production.example', 'utf8');
if (!envExample.includes('SITE_URL=https://tarot.xieyw.top')) {
  console.error('production env sample missing canonical SITE_URL');
  process.exit(1);
}

console.log('\npackage-release: unit tests and typecheck passed.');
console.log('Still required before public launch (ops, not this script):');
console.log('- DNS A tarot.xieyw.top -> production host');
console.log('- TLS certificate');
console.log('- ICP_NUMBER filled at build time');
console.log('- nginx / systemd on the Aliyun host');
