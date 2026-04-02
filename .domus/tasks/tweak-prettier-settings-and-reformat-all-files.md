# Task: Tweak Prettier settings and reformat all files

**ID:** tweak-prettier-settings-and-reformat-all-files
**Status:** raw
**Autonomous:** false
**Priority:** high
**Captured:** 2026-04-02
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

During code review, we discovered that Prettier reformats multi-line `Promise.all` argument lists and similar constructs back onto single lines on commit (via lint-staged). Our coding rules say one element per line for readability, but Prettier's default `printWidth` overrides this.

Also, 12 files on master are currently unformatted (related to the worktree hooks bypass issue tracked separately).

---

## Steps

1. Review current Prettier config (`webclientv4/.prettierrc` or `package.json`)
2. Adjust `printWidth` and/or other settings to better match project style preferences
3. Run `npx prettier --write 'src/**/*.{ts,vue}'` to reformat all files
4. Run type-check and tests to verify no breakage
5. Commit the config change and reformatted files together

---

## Acceptance Criteria

- [ ] Prettier config reviewed and adjusted
- [ ] All Vue and TS files reformatted consistently
- [ ] The 12 currently-unformatted files are now formatted
- [ ] Multi-element expressions stay on multiple lines after commit
- [ ] Type-check and tests pass

---

## Implementation Notes

_Remove if empty._
