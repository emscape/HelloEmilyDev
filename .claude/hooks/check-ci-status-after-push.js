#!/usr/bin/env node
// check-ci-status-after-push.js
// PostToolUse hook — Bash
//
// After a real `git push`, blocks until the corresponding GitHub Actions
// run finishes (or a timeout is hit) and reports the real pass/fail result.
//
// Why this exists: a Claude session pushed several times, reported "CI
// added, tests passing" based only on local runs, and never actually
// checked the GitHub Actions result — which had in fact been failing on
// every single push (a gitignore pattern had silently excluded essential
// source files from the very first commit). Local passes are not proof of
// a green remote run — different environment: fresh clone, no leftover
// local dev servers masking a missing dependency, etc. This hook makes
// that verification structural rather than something an agent has to
// remember to do.
//
// Exit codes (per this project's convention — see hooks.json's
// _exit_codes): 0 = pass/skip, 1 = inform Claude of failure (PostToolUse
// can't block a push that already happened, but should make failure
// impossible to silently miss).

'use strict';

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function readConfig() {
  try {
    const raw = fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8');
    return JSON.parse(raw).ci_status_check || {};
  } catch {
    return {};
  }
}

// Runs a program with an argument array — no shell — so values like the
// branch name are passed literally; a ref name containing shell
// metacharacters can't inject a second command. With timeoutMs, the child
// is killed once the deadline passes and the result is marked timedOut.
function runFile(file, args, { timeoutMs } = {}) {
  try {
    const out = execFileSync(file, args, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      ...(timeoutMs ? { timeout: timeoutMs } : {}),
    });
    return { ok: true, out, timedOut: false };
  } catch (e) {
    return { ok: false, out: e.stdout || '', err: e.stderr || String(e), timedOut: e.code === 'ETIMEDOUT' };
  }
}

function ghRunListArgs(branch) {
  return ['run', 'list', '--branch', branch, '--limit', '5', '--json', 'databaseId,status,conclusion,headSha'];
}

// Synchronous sleep with no external dependency — works cross-platform
// (Windows included) without relying on a shell `sleep` command.
function sleepSync(ms) {
  const sab = new SharedArrayBuffer(4);
  const view = new Int32Array(sab);
  Atomics.wait(view, 0, 0, ms);
}

module.exports = { runFile, ghRunListArgs };

if (require.main === module) {
  const chunks = [];
  process.stdin.on('data', (d) => chunks.push(d));
  process.stdin.on('end', () => {
    let input;
    try {
      input = JSON.parse(Buffer.concat(chunks).toString());
    } catch {
      process.exit(0);
    }

    const cmd = (input?.tool_input?.command || '').trim();

    // Tighter than a bare substring match on purpose — this repo's own
    // check-git-push-audit.js previously had a real bug where
    // `\bgit\b.*\bpush\b` matched any command whose text merely contained
    // "push" anywhere, including unrelated filenames. Require "git push" as
    // adjacent words.
    if (!/(^|[;&|]\s*|\s)git\s+push(\s|$)/.test(cmd)) {
      process.exit(0);
    }

    const config = readConfig();
    if (config.enabled === false) {
      process.exit(0);
    }

    const ghCheck = runFile('gh', ['auth', 'status']);
    if (!ghCheck.ok) {
      console.error('[ci-status-check] gh CLI not available/authenticated — skipping CI verification. Check manually with `gh run list`.');
      process.exit(0);
    }

    const branch = runFile('git', ['branch', '--show-current']).out.trim();
    const sha = runFile('git', ['rev-parse', 'HEAD']).out.trim();
    if (!branch || !sha) {
      process.exit(0); // not in a git repo, or detached HEAD — nothing to verify
    }

    const newRunTimeoutMs = (config.new_run_timeout_seconds ?? 60) * 1000;
    const pollIntervalMs = (config.poll_interval_seconds ?? 5) * 1000;
    const completionTimeoutMs = (config.completion_timeout_seconds ?? 180) * 1000;

    console.error(`[ci-status-check] Waiting for GitHub Actions run on ${branch}@${sha.slice(0, 7)}...`);

    // Phase 1: wait for a run matching this exact commit to appear at all.
    let matchedRun = null;
    const phase1Deadline = Date.now() + newRunTimeoutMs;
    while (Date.now() < phase1Deadline && !matchedRun) {
      const listResult = runFile('gh', ghRunListArgs(branch));
      if (listResult.ok) {
        try {
          const runs = JSON.parse(listResult.out);
          matchedRun = runs.find((r) => r.headSha === sha) || null;
        } catch {
          // malformed JSON — treat as not-found-yet, keep polling
        }
      }
      if (!matchedRun) sleepSync(pollIntervalMs);
    }

    if (!matchedRun) {
      console.error(
        `[ci-status-check] No GitHub Actions run found for ${sha.slice(0, 7)} within ${newRunTimeoutMs / 1000}s. This may mean the repo has no workflow watching this branch, or GitHub is slow to register it. You must manually verify with \`gh run list --branch ${branch}\` before reporting success to the user.`
      );
      process.exit(1);
    }

    // Phase 2: `gh run watch` does its own polling internally and exits
    // non-zero on a failed conclusion with --exit-status — no need to
    // hand-roll a second poll loop. It has no timeout flag of its own, so a
    // queued or stuck run would block the session indefinitely; the child is
    // killed at completion_timeout_seconds instead.
    const watchResult = runFile('gh', ['run', 'watch', String(matchedRun.databaseId), '--exit-status'], {
      timeoutMs: completionTimeoutMs,
    });

    if (watchResult.timedOut) {
      console.error(
        `[ci-status-check] ⏱ CI run ${matchedRun.databaseId} for ${sha.slice(0, 7)} did not finish within ${completionTimeoutMs / 1000}s. Its result is unknown — check \`gh run view ${matchedRun.databaseId}\` before reporting success to the user.`
      );
      process.exit(1);
    }

    if (watchResult.ok) {
      console.error(`[ci-status-check] ✅ CI PASSED for ${sha.slice(0, 7)} (run ${matchedRun.databaseId}).`);
      process.exit(0);
    }

    console.error(
      `[ci-status-check] ❌ CI FAILED for ${sha.slice(0, 7)} (run ${matchedRun.databaseId}). Run \`gh run view ${matchedRun.databaseId} --log-failed\` to see why before telling the user this succeeded.`
    );
    process.exit(1);
  });
}
