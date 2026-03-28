# Idea: Worktree-with-Ports Skill

**Captured:** 2026-03-26
**Status:** raw

---

## The Idea

A Claude Code skill that automates the full "spin up an isolated worktree for feature work" flow. Invoked like: "new worktree for X, ports 30YY and 42ZZ". It should:

1. Create a new git worktree with a branch named after X
2. Modify `webclientv4/vite.config.ts` server port to 42ZZ
3. Modify `webclientv4/src/api/api-gateway.ts` BASE_URL to use port 30YY
4. Modify `webclientv4/src/api/api-gateway.spec.ts` to match the new port
5. Print two copy-paste-ready one-liner commands:
   - `cd <worktree>/webclientv4 && npm i && npm run dev` (Vite on 42ZZ)
   - `cd <worktree> && PORT=30YY rails s` (Rails on 30YY)

The user runs the servers themselves — server output in Claude's context floods it and wastes tokens.

---

## Why This Is Worth Doing

This is a frequent workflow: starting parallel feature work in isolation. Currently requires manually editing three files and remembering the right ports. Automating it removes friction and makes worktree-based development the default rather than an occasional thing.

---

## Open Questions / Things to Explore

- What should the skill be named? "switch-to-worktree" is the starting point, but it does more than switch
- Should it integrate with `EnterWorktree` or replace it with its own git worktree creation?
- Should default port offsets be configurable (e.g. base port + worktree number)?
- Should it also handle CORS config if origins ever stop being `*`?
- Should the skill also add the worktree to `.gitignore` or is that already handled?
- Should it verify `npm i` is needed (check for existing node_modules) or always include it?
