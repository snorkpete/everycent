---
name: local-review
description: Use for interactive hunk-by-hunk review of a commit or diff with the user, applying fixes in real time. Fires on /local-review, optionally followed by a SHA, branch, or range.
version: 1.0.0
---

# Local Review

Interactive hunk-by-hunk code review of a commit or diff with the user. Walk through changes together, take feedback, apply fixes in real time.

## Activation

Invoke with `/local-review` optionally followed by a commit SHA, branch name, or range. If no argument is given, review the most recent commit on the current branch.

Examples:
- `/local-review` — review latest commit on current branch
- `/local-review abc1234` — review a specific commit
- `/local-review abc1234 def5678` — review two commits sequentially
- `/local-review feature-branch` — review all commits on feature-branch not on master

## Setup

1. Identify the commit(s) to review. Show the file list (`git show <sha> --stat`).
2. Preload all diffs upfront — split by file, filter out pure-reformatting hunks. Have them ready so the reviewer never waits for a git command between hunks.
3. If multiple commits, review them sequentially — all hunks from commit 1 before moving to commit 2.

## Walking Through Hunks

For each hunk, show:

1. **Header:** `File X/Y: filename` — include `(new file)` or `(deleted)` where applicable
2. **Diff:** Full patch in a fenced code block with syntax highlighting. Never truncate or use ellipsis — the point is to review the code. The only exception: skip hunks that are purely formatting changes (whitespace, line wrapping by Prettier, etc.).
3. **Separator:** `---`
4. **Review comment:** Brief note on what the change does and why. Flag anything notable. For mechanical/boring changes, say so ("mechanical — nothing surprising") so the reviewer knows how closely to look.

Then wait for reviewer feedback.

## Handling Feedback

- **No feedback / "go" / "next":** Move to next hunk.
- **"skip file":** Skip remaining hunks in the current file, move to next file.
- **"skip to [filename]":** Jump to a specific file.
- **"lgtm":** Approve all remaining hunks. Run pre-commit checks and commit.
- **Small fix requested:** Execute immediately, show the diff, move on.
- **Larger change requested:** Execute, show the diff, wait for reviewer approval before moving on. Note: "larger" means the change touches multiple locations or involves judgement calls.
- **Investigation requested:** Confirm or deny the reviewer's theory first. Do NOT execute until told. The reviewer wants to understand before deciding.
- **Unclear which category:** Default to cautious — show what you'd do and ask before executing.

## After Review

1. Run full pre-commit checks (`npm run type-check`, `npm run test`, `bundle exec rspec`).
2. If checks fail, fix the issue — do not use `--no-verify`.
3. Commit review changes as a separate commit from the original work.
4. Report: summary of changes made during review.

## Rules

- Never hide parts of the patch. Show full diffs.
- Skip pure reformatting hunks (Prettier whitespace changes).
- Pre-existing issues in touched files are in scope — if you see a type error or lint violation in a file being reviewed, flag it.
- Do not start executing on suggestions without confirmation — investigate and confirm first.
- Background work (like investigating a tangential question) is fine, but pause the review walkthrough while doing so. Don't try to continue both in parallel.
