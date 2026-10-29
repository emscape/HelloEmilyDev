#!/usr/bin/env node
// check-commit-message.js
// PreToolUse hook — Bash
//
// Checks every `git commit` in a Bash call for the commit-message markers in
// config.json's commit_guard.required_markers (default WHY: and EXPECTED:),
// then blocks or warns per commit_guard.on_violation (default block).
//
// Commands are split and normalized with lib/git-command.cjs, the same
// parser the push/merge guards use, so `echo ok && git commit ...`,
// `git -C <dir> commit`, `/usr/bin/git commit` and `bash -c "git commit ..."`
// are all checked — and markers sitting in a different command of the
// chain don't count toward the commit's own message.

'use strict';

const { loadHookConfig } = require('./lib/hook-config.cjs');
const { commandSegments } = require('./lib/git-command.cjs');

const DEFAULT_MARKERS = ['WHY:', 'EXPECTED:'];

// A heredoc body spans lines, but belongs to the command that opened it
// (`git commit -F - <<'EOF'`). Left in place, the segment splitter would cut
// it on its newlines — and on any apostrophe in the prose — so each body is
// lifted out first and replaced by a token that's expanded again only for
// the segment that owns it.
const HEREDOC_RE = /<<-?\s*(['"]?)([A-Za-z_]\w*)\1([^\n]*)\n([\s\S]*?)\n[ \t]*\2[ \t]*(?=\n|$)/g;
const HEREDOC_TOKEN_RE = /__HEREDOC_(\d+)__/g;

function liftHeredocs(command) {
  const bodies = [];
  const text = command.replace(HEREDOC_RE, (_m, _q, _tag, rest, body) => {
    bodies.push(body);
    return `<<__HEREDOC_${bodies.length - 1}__${rest}`;
  });
  return { text, bodies };
}

function missingMarkers(command, markers = DEFAULT_MARKERS) {
  const { text, bodies } = liftHeredocs(command || '');
  for (const { raw, normalized } of commandSegments(text)) {
    if (!/^git\s+commit(?:\s|$)/.test(normalized)) continue;
    const message = raw.replace(HEREDOC_TOKEN_RE, (_m, i) => `\n${bodies[i]}\n`);
    const missing = markers.filter((m) => !message.includes(m));
    if (missing.length > 0) return { segment: raw.replace(HEREDOC_TOKEN_RE, '<<heredoc'), missing };
  }
  return null;
}

// The first `git commit` segment missing a required marker, or null.
function findUnmarkedCommit(command, markers = DEFAULT_MARKERS) {
  const found = missingMarkers(command, markers);
  return found ? found.segment : null;
}

// What the hook should do with a command under a commit_guard config:
// { action: 'allow' | 'warn' | 'block', segment?, missing? }.
function commitVerdict(command, guard = {}) {
  if (guard.enabled === false) return { action: 'allow' };
  const markers = Array.isArray(guard.required_markers) && guard.required_markers.length > 0
    ? guard.required_markers
    : DEFAULT_MARKERS;
  const found = missingMarkers(command, markers);
  if (!found) return { action: 'allow' };
  return { action: guard.on_violation === 'warn' ? 'warn' : 'block', ...found };
}

module.exports = { findUnmarkedCommit, commitVerdict };

if (require.main === module) {
  const chunks = [];
  process.stdin.on('data', (chunk) => chunks.push(chunk));
  process.stdin.on('end', () => {
    let input;
    try {
      input = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    } catch {
      process.exit(0);
    }

    let guard = {};
    try {
      guard = loadHookConfig({ hooksDir: __dirname }).commit_guard || {};
    } catch {
      // Unreadable shared config: keep enforcing with the defaults.
    }

    const verdict = commitVerdict(input?.tool_input?.command, guard);
    if (verdict.action === 'allow') process.exit(0);

    const reason = `Commit messages must include ${verdict.missing.join(' and ')} section(s). Use the required format before proceeding.`;
    if (verdict.action === 'warn') {
      process.stderr.write(`[commit-guard] WARN: ${reason}\n  Command: ${verdict.segment}\n`);
      process.exit(0);
    }
    process.stdout.write(JSON.stringify({ continue: false, stopReason: reason }));
    process.exit(2);
  });
}
