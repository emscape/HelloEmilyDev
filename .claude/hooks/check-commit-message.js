#!/usr/bin/env node
// check-commit-message.js
// PreToolUse hook — Bash
//
// Blocks a `git commit` whose message lacks WHY and EXPECTED sections.
//
// Each chained command is checked on its own (via check-merge-guard.js's
// quote-aware segmentsOf), so `echo ok && git commit -m "..."` can't slip
// past an anchored `^git commit` match, and markers sitting in a different
// segment of the chain don't count toward the commit's own message.

'use strict';

const { segmentsOf } = require('./check-merge-guard.js');

// A heredoc body spans lines, but belongs to the command that opened it
// (`git commit -F - <<'EOF'`). Left in place, segmentsOf would split it on
// its newlines — and on any apostrophe in the prose — so each body is
// lifted out first and replaced by a token that's expanded again only for
// the segment that owns it.
const HEREDOC_RE = /<<-?\s*(['"]?)([A-Za-z_]\w*)\1([^\n]*)\n([\s\S]*?)\n[ \t]*\2[ \t]*(?=\n|$)/g;

function liftHeredocs(command) {
  const bodies = [];
  const text = command.replace(HEREDOC_RE, (_m, _q, _tag, rest, body) => {
    bodies.push(body);
    return `<<__HEREDOC_${bodies.length - 1}__${rest}`;
  });
  return { text, bodies };
}

// Returns the first `git commit` segment missing a required marker, or null.
function findUnmarkedCommit(command) {
  const { text, bodies } = liftHeredocs(command || '');
  for (const segment of segmentsOf(text)) {
    if (!/^git\s+commit\b/.test(segment)) continue;
    const message = segment.replace(/__HEREDOC_(\d+)__/g, (_m, i) => `\n${bodies[i]}\n`);
    if (!/WHY:/.test(message) || !/EXPECTED:/.test(message)) return segment;
  }
  return null;
}

module.exports = { findUnmarkedCommit };

if (require.main === module) {
  const chunks = [];
  process.stdin.on('data', chunk => chunks.push(chunk));
  process.stdin.on('end', () => {
    let input;
    try {
      input = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    } catch {
      process.exit(0);
    }

    if (findUnmarkedCommit(input?.tool_input?.command) === null) {
      process.exit(0);
    }

    process.stdout.write(
      JSON.stringify({
        continue: false,
        stopReason:
          'Commit messages must include WHY and EXPECTED sections. Use the required format before proceeding.',
      })
    );
    process.exit(2);
  });
}
