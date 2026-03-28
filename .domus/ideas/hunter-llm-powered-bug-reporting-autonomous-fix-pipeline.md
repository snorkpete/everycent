# Idea: Hunter — LLM-Powered Bug Reporting & Autonomous Fix Pipeline

**Date:** 2026-03-28

---

## The Idea

A new domus staff role called **hunter** that enables non-dev users to report bugs through a chat interface inside Everycent. The hunter conducts a diagnostic conversation — patiently extracting explicit reproduction steps, cross-referencing server error logs and the deployed source code, querying the database (read-only, household-scoped) to confirm hypotheses, and packaging the result into a GitHub issue with a clear diagnosis.

From there, the existing domus pipeline takes over:
1. **Taskmaster** picks up the issue, asks clarifying questions via GitHub comments, prepares the task (acceptance criteria, plan, restrictions), and requests human approval.
2. **Human approves** — as lightweight as a specific comment on the issue. Can fire up Claude for deeper discussion if needed.
3. **Workers** implement the fix. A merge agent handles the MR.
4. **Human reviews the MR** — can review traditionally, approve blindly, or pre-authorize auto-merge via a comment.

Each checkpoint (taskmaster Q&A, task approval, MR review) is available but bypassable. Trust increases over time.

### Hunter's Capabilities
- **Chat interface** inside Everycent (user-facing, non-dev friendly)
- **Source code access** — read-only, deployed version (fetched from GitHub or bundled at build time)
- **Server log access** — error messages are a primary debugging signal
- **Database access** — read-only, household-scoped, via simple query APIs (no direct DB, no mutation). Used to confirm hypotheses, not explore blindly.
- **GitHub integration** — creates issues with structured diagnosis

### Key Insight
The core skill being offloaded is **extracting explicit reproduction steps** — the tedious back-and-forth that's a big part of owning a system. The hunter is patient where a human would get frustrated, keeps asking "and then what?" until the picture is clear. Most bugs can be figured out without running the code — just by knowing the codebase, having the error message, and understanding exactly what the user did.

### Scope
This is a **domus capability** built as a separate module (chat interface, GitHub integration, DB/source access — well beyond core domus). Everycent is the guinea pig. Build inside Everycent first, extract to domus after learning what's project-specific vs. generic.

---

## Feasibility Notes

### Server Error Logs — Structured Error Capture

Everycent currently has no error tracking (no Sentry, no log drain). Heroku's built-in logs are ephemeral (~1500 lines) and lack structure — useless if a user reports a bug hours later.

**Feasible path:** A lightweight `error_logs` table in Postgres. Rails middleware catches unhandled exceptions and writes structured records: household, timestamp, request path, params, exception class, message, backtrace. Household-scoped like everything else. The hunter queries this through the same read-only API it uses for other DB access.

**Why this over external services:** No new dependency, no addon cost, fits the existing data model. The hunter doesn't need log aggregation or dashboards — it needs to answer "what error happened when this user did X around this time?" A simple table with an index on household + timestamp handles that.

**Not committed to this approach** — just confirming there's at least one viable, low-cost path that doesn't require new infrastructure.

---

## Why This Is Worth Doing

- Turns the most tedious part of system ownership (bug triage interviews) into an automated, patient process
- Non-dev users get a direct path to reporting bugs without needing to write technical descriptions
- The full pipeline (report → diagnose → task → implement → deploy) means bugs can be fixed with minimal human intervention
- Human stays in the loop for quality control at every stage, but can progressively trust the system more
- Builds toward a vision where the human's role is guidance and judgment, not execution

---

## Open Questions / Things to Explore

- How does the hunter access the deployed source code? Options: fetch from GitHub at deploy time, bundle into a readable directory at build, or something else. Need to try multiple approaches.
- How does the hunter access server logs? Structured error capture in Postgres is one feasible path (see Feasibility Notes). Other options: Heroku log drain, external service. Decision deferred.
- What's the right DB query API shape? Needs to be read-only, household-scoped, and limited enough to be safe but useful enough for diagnosis.
- How does the chat interface integrate into Everycent's frontend? New route, slide-out panel, separate page?
- What LLM powers the hunter? Same model as domus agents, or a different one optimized for conversation?
- How does the hunter know which version of source is deployed? Needs a version/commit reference captured at deploy time.
- GitHub issue format — what structure makes handoff to the taskmaster seamless?
- Long-term: can the hunter accumulate project-specific knowledge about common bug patterns to improve diagnosis over time?
- Should this be a separate domus module/package, or just a new role within the existing domus codebase?
