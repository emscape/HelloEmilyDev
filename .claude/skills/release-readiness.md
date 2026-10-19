# Skill: release-readiness

## Purpose
Validate that a branch is safe to merge. HelloEmily.dev has no release builds or tags: every merge to `main` is deployed straight to production by `.github/workflows/static.yml` (GitHub Pages), so the merge itself is the release.

## When to Use
- Before asking for a PR to be merged
- After finishing a cleanup phase or feature branch

## Output Expectations
A readiness checklist with PASS/FAIL per gate:

### Gate 1: Test Suite
- [ ] `npm test` passes (Vitest)
- [ ] No skipped tests without a documented reason
- [ ] If `.claude/hooks/` changed: `node --test .claude/hooks/*.test.js` passes

### Gate 2: Content Validation
- [ ] `npm run blog:validate` passes
- [ ] Any new or renamed page or post is listed in `sitemap.xml`
- [ ] New posts appear in `data/blog-index.json`

### Gate 3: Visual Check
- [ ] Visual changes checked on a local server (`py -m http.server 8000`, then http://localhost:8000/)
- [ ] No console errors on the changed pages

### Gate 4: Accessibility
- [ ] Colour, landmark or heading changes re-checked with Oobee (`OOBEE_DISABLE_TELEMETRY=1 npx @govtechsg/oobee -c 2 -u http://localhost:8000/ -b 1`)
- [ ] Text contrast stays at 4.5:1 or above

### Gate 5: Deploy Workflow
- [ ] If `.github/workflows/static.yml` changed: it still uploads the site and excludes internal files (`.claude/`, `CLAUDE.md`)
- [ ] After merge: the Pages deploy run succeeded (`gh run list --workflow static.yml --limit 1`) — the workflow only runs on `main`, so PRs have no check to wait for

## Constraints
- ALL gates must PASS before a merge is requested
- Never ship with known silent failures (QS5)
- PRs are merged on GitHub by Emily, never from the assistant

## Example Invocation
```
/release-readiness
```
