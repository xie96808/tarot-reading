#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const result = spawnSync(
  'npx',
  [
    'vitest',
    'run',
    'src/data/lexicons/zh-1/__tests__/lexicon.test.ts',
    'src/data/lexicons/zh-1/__tests__/pause-catalog.test.ts',
    'src/data/__tests__/spreads.test.ts',
    'src/lib/__tests__/reading-golden.test.ts',
    'src/lib/__tests__/deck-filter.test.ts',
  ],
  { stdio: 'inherit' },
);
process.exit(result.status ?? 1);
