// check-git-push-audit.test.js
// Behavioral tests for how the push audit picks the commit range to diff —
// run with `node --test .claude/hooks/*.test.js`.
//
// check-git-push-audit.js only runs its stdin-driven hook lifecycle when
// executed directly (`require.main === module`), so requiring it here is
// safe. refExists is injected so results don't depend on the real repo.

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { pushDiffRange, EMPTY_TREE } = require('./check-git-push-audit.js');

const has = (...refs) => (ref) => refs.includes(ref);

test('pushDiffRange', async (t) => {
  await t.test('diffs every unpushed commit against the upstream when one is set', () => {
    assert.deepEqual(pushDiffRange(has('@{upstream}', 'origin/HEAD', 'HEAD~1')), {
      range: '@{upstream}...HEAD',
      label: 'unpushed commits vs. @{upstream}',
    });
  });

  await t.test("falls back to the remote's default branch for a branch with no upstream yet", () => {
    assert.deepEqual(pushDiffRange(has('origin/HEAD', 'origin/main', 'HEAD~1')), {
      range: 'origin/HEAD...HEAD',
      label: 'branch commits vs. origin/HEAD',
    });
  });

  await t.test('uses origin/main when origin/HEAD is not set locally', () => {
    assert.equal(pushDiffRange(has('origin/main', 'HEAD~1')).range, 'origin/main...HEAD');
  });

  await t.test('uses origin/master when that is the only remote default branch', () => {
    assert.equal(pushDiffRange(has('origin/master', 'HEAD~1')).range, 'origin/master...HEAD');
  });

  await t.test('falls back to HEAD~1 when there is no remote-tracking ref at all', () => {
    assert.deepEqual(pushDiffRange(has('HEAD~1')), { range: 'HEAD~1 HEAD', label: 'HEAD~1' });
  });

  await t.test('diffs a root commit against the empty tree', () => {
    assert.deepEqual(pushDiffRange(has()), {
      range: `${EMPTY_TREE} HEAD`,
      label: 'root commit (vs. empty tree)',
    });
  });
});
