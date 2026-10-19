// check-ci-status-after-push.test.js
// Behavioral tests for the CI-status hook's process helpers — run with
// `node --test .claude/hooks/*.test.js`.
//
// check-ci-status-after-push.js only runs its stdin-driven hook lifecycle
// when executed directly (`require.main === module`), so requiring it here
// is safe.

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { runFile, ghRunListArgs } = require('./check-ci-status-after-push.js');

test('ghRunListArgs', async (t) => {
  await t.test('passes a branch containing shell metacharacters as one literal argument', () => {
    const branch = 'feat/x;touch${IFS}pwned';
    const args = ghRunListArgs(branch);
    assert.deepEqual(args, [
      'run', 'list', '--branch', branch, '--limit', '5', '--json', 'databaseId,status,conclusion,headSha',
    ]);
  });
});

test('runFile', async (t) => {
  await t.test('returns stdout without invoking a shell', () => {
    const result = runFile(process.execPath, ['-e', 'process.stdout.write(process.argv[1])', 'a;echo b']);
    assert.deepEqual(result, { ok: true, out: 'a;echo b', timedOut: false });
  });

  await t.test('reports a non-zero exit as not ok', () => {
    const result = runFile(process.execPath, ['-e', 'process.exit(3)']);
    assert.equal(result.ok, false);
    assert.equal(result.timedOut, false);
  });

  await t.test('kills a child that outlives the timeout and reports it as timed out', () => {
    const started = Date.now();
    const result = runFile(process.execPath, ['-e', 'setTimeout(() => {}, 20000)'], { timeoutMs: 300 });
    assert.equal(result.ok, false);
    assert.equal(result.timedOut, true);
    assert.ok(Date.now() - started < 10000, 'child was not killed at the deadline');
  });
});
