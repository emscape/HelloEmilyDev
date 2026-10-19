// check-commit-message.test.js
// Behavioral tests for the commit-message guard's detection logic — run
// with `node --test .claude/hooks/*.test.js`.

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { findUnmarkedCommit } = require('./check-commit-message.js');

const GOOD = 'git commit -m "Fix thing\n\nWHY:\n- reason\n\nEXPECTED:\n- outcome"';

test('findUnmarkedCommit', async (t) => {
  await t.test('allows a commit whose message has WHY and EXPECTED', () => {
    assert.equal(findUnmarkedCommit(GOOD), null);
  });

  await t.test('blocks a bare commit missing both markers', () => {
    assert.equal(findUnmarkedCommit('git commit -m "missing sections"'), 'git commit -m "missing sections"');
  });

  await t.test('blocks a commit missing only EXPECTED', () => {
    assert.notEqual(findUnmarkedCommit('git commit -m "x\n\nWHY:\n- y"'), null);
  });

  await t.test('blocks a commit chained after another command with &&', () => {
    assert.equal(
      findUnmarkedCommit('echo ok && git commit -m "missing sections"'),
      'git commit -m "missing sections"'
    );
  });

  await t.test('blocks a commit chained after cd with ;', () => {
    assert.notEqual(findUnmarkedCommit('cd /repo; git commit -m "nope"'), null);
  });

  await t.test('blocks a commit on a later line of a multi-line command', () => {
    assert.notEqual(findUnmarkedCommit('git add .\ngit commit -m "nope"'), null);
  });

  await t.test('allows a well-formed commit chained after git add', () => {
    assert.equal(findUnmarkedCommit(`git add . && ${GOOD}`), null);
  });

  await t.test('does not let markers in another segment satisfy the commit', () => {
    assert.notEqual(findUnmarkedCommit('echo "WHY: EXPECTED:" && git commit -m "nope"'), null);
  });

  await t.test('ignores commands that only mention git commit inside a quoted string', () => {
    assert.equal(findUnmarkedCommit('echo "run git commit later"'), null);
  });

  await t.test('allows a commit whose message is fed through a heredoc on stdin', () => {
    const cmd = "git add -A && git commit -q -F - <<'EOF'\nFix thing\n\nWHY:\n- it's broken\n\nEXPECTED:\n- works\nEOF\ngit log --oneline -1";
    assert.equal(findUnmarkedCommit(cmd), null);
  });

  await t.test('allows a commit whose -m uses $(cat <<EOF) with an apostrophe in the body', () => {
    const cmd = 'git commit -m "$(cat <<\'EOF\'\nFix thing\n\nWHY:\n- don\'t break\n\nEXPECTED:\n- works\nEOF\n)"';
    assert.equal(findUnmarkedCommit(cmd), null);
  });

  await t.test('blocks a heredoc-fed commit whose body lacks the markers', () => {
    assert.notEqual(findUnmarkedCommit("git commit -F - <<'EOF'\nJust a summary\nEOF"), null);
  });

  await t.test('does not let a heredoc fed to another command satisfy the commit', () => {
    const cmd = "cat > notes.txt <<'EOF'\nWHY:\nEXPECTED:\nEOF\ngit commit -m \"nope\"";
    assert.notEqual(findUnmarkedCommit(cmd), null);
  });

  await t.test('ignores non-commit git commands', () => {
    assert.equal(findUnmarkedCommit('git status && git log -1'), null);
  });
});
