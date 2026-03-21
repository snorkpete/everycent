# Task: Repair existing idea MD files to current format

**Status:** done
**Status:** done
**ID:** repair-existing-idea-md-files-to-current-format
**Status:** done
**Autonomous:** true
**Priority:** normal
**Captured:** 2026-03-14
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Two-part repair:

**Part 1 — Migrate existing idea MD files in both projects.**
Old idea MD files were created before the current CLI template existed. They use stale field names (`**Date:**`, `**Project:**`) and are missing `**Status:**`. Each file needs its header block updated in-place. Body content (everything below the `---` separator) must not be touched.

**Part 2 — Fix `updateMarkdownStatus` in the domus CLI.**
`updateMarkdownStatus` in `src/lib/jsonl.ts` only replaces an existing `**Status:**` line via regex. If no `**Status:**` line is present (as in old-format files), it silently does nothing. The fix: when the regex replacement produces no change, insert a `**Status:** <value>` line immediately after the `# Idea: ...` title line.

---

## Acceptance Criteria

- [ ] All 5 everycent idea MD files have `**Date:**` renamed to `**Captured:**`, `**Project:**` line removed, and `**Status:** raw` inserted after `**Captured:**`
- [ ] All 14 domus idea MD files have `**Date:**` renamed to `**Captured:**` (they already have `**Status:**`, so no insert needed)
- [ ] After migration, running `domus idea status <id> <status>` on any of these files correctly updates the `**Status:**` line
- [ ] `updateMarkdownStatus` inserts a `**Status:**` line (after the title line) when none exists, rather than silently doing nothing
- [ ] The `detailContent` template in `cmdAdd` (`src/commands/idea.ts`) uses `**Captured:**` instead of `**Date:**` so all newly created files match the repaired format
- [ ] Body content of all repaired files is unchanged

---

## Implementation Notes

### Everycent ideas — before/after for each file

All 5 everycent files follow the same pattern. Current header:

```
# Idea: <Title>

**Date:** <value or unknown>
**Project:** Everycent Migration
```

Target header (insert `**Status:** raw` as the third field, matching JSONL status):

```
# Idea: <Title>

**Captured:** <value or unknown>
**Status:** raw
```

Files to repair (all in `/Users/kion/code/everycent/.domus/ideas/`):

| File | `**Date:**` value | `**Status:**` value (from JSONL) |
|------|-------------------|----------------------------------|
| `auto-categorisation-on-import.md` | `unknown` | `raw` |
| `resilient-transaction-import.md` | `unknown` | `raw` |
| `google-auth-migration.md` | `2026-03-11` | `raw` |
| `analytics-and-observability.md` | `2026-03-11` | `raw` |
| `everycent-mcp-server.md` | `2026-03-10` | `raw` |

### Domus ideas — before/after for each file

All 14 domus files already have `**Status:**` but use `**Date:**` instead of `**Captured:**`. No `**Project:**` field is present. Change is rename-only.

Current header pattern:

```
# Idea: <Title>

**Date:** <value>
**Status:** <value>
```

Target header:

```
# Idea: <Title>

**Captured:** <value>
**Status:** <value>
```

Files to repair (all in `/Users/kion/code/domus/.domus/ideas/`):

- `periodic-automated-cleanup-of-completed-tasks-and-ideas.md`
- `spec-system-behavioural-contracts-for-the-codebase.md`
- `plans-and-autonomous-tasks-are-the-same-artifact.md`
- `global-vs-project-local-domus-workspace.md`
- `domus-codebase-architecture-document.md`
- `oracle-session-ux-pick-then-launch-vs-launch-then-pick.md`
- `adr-support-in-the-spec-system.md`
- `interactive-session-model-and-launch-command-design.md`
- `domus-skills-plugin-system.md`
- `subagent-strategy-for-domus-workflow.md`
- `domus-as-the-sole-gateway-to-index-and-taskidea-data.md`
- `testing-strategy-for-domus.md`
- `session-orientation-how-does-a-new-session-know-what-to-do-next.md`
- `standardize-idea-md-file-format-to-match-task-md-conventions.md`

### `updateMarkdownStatus` fix — `/Users/kion/code/domus/src/lib/jsonl.ts`

Current code:

```typescript
export async function updateMarkdownStatus(
  filePath: string,
  newStatus: string,
): Promise<void> {
  if (!existsSync(filePath)) return;
  const content = await readFile(filePath, "utf-8");
  const updated = content.replace(
    /^\*\*Status:\*\* .+$/m,
    `**Status:** ${newStatus}`,
  );
  if (updated !== content) {
    await writeFile(filePath, updated, "utf-8");
  }
}
```

Change: when `updated === content` (no `**Status:**` line found), insert one after the first line (the `# Idea: ...` title):

```typescript
export async function updateMarkdownStatus(
  filePath: string,
  newStatus: string,
): Promise<void> {
  if (!existsSync(filePath)) return;
  const content = await readFile(filePath, "utf-8");
  const updated = content.replace(
    /^\*\*Status:\*\* .+$/m,
    `**Status:** ${newStatus}`,
  );
  if (updated !== content) {
    await writeFile(filePath, updated, "utf-8");
    return;
  }
  // No Status line present — insert one after the title line
  const withInserted = content.replace(
    /^(# .+\n)/m,
    `$1\n**Status:** ${newStatus}`,
  );
  if (withInserted !== content) {
    await writeFile(filePath, withInserted, "utf-8");
  }
}
```

### `cmdAdd` template fix — `/Users/kion/code/domus/src/commands/idea.ts`

In `cmdAdd`, the `detailContent` string currently uses `**Date:** ${dateToday}`. Change it to `**Captured:** ${dateToday}`.

### Execution order

1. Fix `updateMarkdownStatus` and the `cmdAdd` template in the domus CLI first.
2. Repair the 14 domus idea MD files.
3. Repair the 5 everycent idea MD files.
4. Verify by running `domus idea list` and `domus --root /Users/kion/code/domus idea list` — confirm no errors and statuses are consistent.
5. Spot-check one file from each project to confirm headers look correct.
