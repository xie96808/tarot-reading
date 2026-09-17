import { readFileSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

const base = {
  ...process.env,
  SYNC_HOST: 'example.invalid', SYNC_USER: 'tarot-sync', SYNC_PORT: '22',
  SYNC_PRIVATE_KEY: 'test-only', SYNC_KNOWN_HOSTS: 'test-only',
  GITHUB_SHA: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
};

describe('source sync validation', () => {
  it.each([
    ['SYNC_HOST', '-oProxyCommand=bad', 'Invalid host'],
    ['SYNC_USER', 'root;echo bad', 'Invalid SSH user'],
    ['SYNC_PORT', '0', 'Invalid SSH port'],
    ['GITHUB_SHA', '../outside', 'Invalid commit SHA'],
  ])('rejects malformed %s before any network operation', (key, value, message) => {
    const result = spawnSync('bash', ['deploy/sync-source.sh'], { env: { ...base, [key]: value }, encoding: 'utf8' });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain(message);
  });

  it('uses main-only triggers, read-only permissions and a pinned checkout', () => {
    const workflow = readFileSync('.github/workflows/sync-main.yml', 'utf8');
    expect(workflow).toContain('branches: [main]');
    expect(workflow).toContain("github.ref == 'refs/heads/main'");
    expect(workflow).toContain('contents: read');
    expect(workflow).toMatch(/actions\/checkout@[0-9a-f]{40}/);
    expect(workflow).toContain('persist-credentials: false');
    const script = readFileSync('deploy/sync-source.sh', 'utf8');
    expect(script).toContain('StrictHostKeyChecking=yes');
    expect(script).toContain('git archive "$GITHUB_SHA"');
    expect(script).not.toContain('--delete');
    expect(script).not.toContain('systemctl');
  });
});
