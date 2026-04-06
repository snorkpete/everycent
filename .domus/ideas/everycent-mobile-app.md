# Idea: Everycent Mobile App

**Captured:** 2026-03-15
**Last refined:** 2026-04-06
**Status:** raw

---

## Next Ideation

~~**Conflict resolution for offline sync.** — resolved 2026-04-06, see Offline + Sync section. Core insight: the real problem is dedup of offline-created records, not classic edit conflicts.~~

**Next:** Ready for refinement into buildable work (taskmaster), or more ideation on transaction import UX on mobile.

---

## The Idea

Build a mobile app for everycent. Primary user is wife — checking balances and capturing transactions on the go. The product need is modest (mobile web would suffice), but the real driver is learning mobile development end-to-end, including offline-first architecture.

---

## Why This Is Worth Doing

**Product value**
- Wife wants to check everycent on her phone without opening a laptop
- Quick transaction capture on the go (don't have to remember to do it later)
- Mobile web works but a native app unlocks better UX and offline support

**Personal/dev value — the primary driver**
- Zero mobile dev experience — this is about building that entire skill set
- Offline-first architecture is a genuinely hard problem worth understanding
- Multiple implementation approaches (PWA → Flutter → React Native → native) each teach different things
- Eventually: chat interface on mobile ties into NLQ project, with native-specific challenges (streaming responses, dynamic result presentation)

---

## Core Use Cases

1. **Check balances / budget status** — glance at where things stand (read-only)
2. **Capture transactions** — quick entry on the go
3. That's it. Editing budgets, managing allocations, etc. stays on laptop.

---

## Technology Approach (phased learning)

### Phase 1: Mobile web
- Improve the existing mobile view
- Ship a home screen shortcut for wife — immediate value, no new tech

### Phase 2: PWA + offline
- Add service worker, install prompt, basic offline support
- First real exposure to PWA concepts (known in theory, never built)
- Quick learning, still in Vue/web land

### Phase 3: Flutter (offline-first)
- New language (Dart), new paradigm (widget composition), new mental model
- **Offline-first from the start** — architect for local storage + sync from day one, even if full offline comes later. Retrofitting offline is dramatically harder than planning for it.
- Android only (no iOS — not used, not worth supporting unless mobile dev becomes professional)
- Biggest learning-per-hour of all the mobile options
- Flutter web exists — skills transfer back to web if desired

### Phase 4 (optional): Native Android (Kotlin)
- Understanding the bottom of the stack — what Flutter abstracts away
- Only if curiosity about native platform internals demands it

### Phase 5 (really optional): React Native
- Already knows React (used it professionally for 2-3 years, just dislikes it)
- Value is purely comparative: "how does the same app feel in Flutter vs RN?"
- Unlikely to happen — listed as an idealistic opportunity, not a real plan

### Skipped
- **Capacitor/Ionic** — web in a native shell. Not enough new learning to justify a separate phase.

---

## Architecture Considerations

### Offline + Sync
- Offline-first is an architectural decision, not a feature to bolt on later
- Local storage model must be designed for eventual sync from the start

**Conflict resolution (ideated 2026-04-06):**
The spectrum: last-write-wins (simple, lossy) → field-level merge → operational transforms (Google Docs style) → CRDTs (mathematically convergent) → event sourcing (append-only log).

For everycent, the real problem isn't classic edit conflicts — it's **deduplication of offline-created records.** New transactions created on the phone don't have server IDs. If the same transaction also arrives via bank import before sync, there's no shared identity to compare.

- **Strategy: fingerprinting + flag for review.** Match on amount + date + rough payee. Surface potential duplicates at sync time on a dedicated review screen. Don't silently merge or duplicate — be honest about uncertainty.
- **For edits:** field-level merge is probably sufficient at everycent's scale. Two people rarely edit the same field simultaneously. When they do, flag it.
- **Dedup compounds** when bank import and manual phone capture overlap — the same transaction can arrive from two different sources with no shared ID.
- CRDTs and OT are overkill for this use case but worth understanding conceptually.

### Mobile-specific APIs
- Current Rails API is shaped for web clients
- Mobile needs different characteristics: smaller payloads, fewer round trips, possibly background sync
- Separate API namespace (same pattern as `/api/mcp/` for the MCP server)
- Not a new concept — same approach used in previous work (client-facing portal over OLTP system)

### Real-time connections
- Relevant for two use cases: (1) streaming chat responses from NLQ, (2) instant sync when wife captures a transaction and it should appear on web immediately
- Same infrastructure serves both — worth considering together

### Chat interface on mobile
- Streaming LLM responses in native UI ≠ streaming into a web div — different rendering model (widget tree updates)
- Dynamic result presentation: LLM returns tables, numbers, paragraphs — on web, render HTML. On native, need to handle unknown result shapes natively
- Ties into NLQ phase 2 (chat UI) — mobile version is a parallel concern

### Authentication
- Google auth — not a place to experiment. Use proven approach (Google sign-in SDK, possibly Auth0)
- Native Google sign-in flows are smoother than web OAuth — this is a plus
- Auth work from NLQ project (google-auth-migration) feeds directly into this

### App Store
- Yes — Play Store distribution (Android only, no iOS)
- Introduces review processes, signing, update mechanisms as things to learn

### Push Notifications
- No strong product use case currently
- Possible nice-to-haves: over-budget warnings, "nearing end of budget" alerts
- Worth exploring once the app is functional, not a driver

---

## Relationship to Other Ideas

- **`google-auth-migration`** — prerequisite (mobile needs solid auth, Google sign-in is smoother on native)
- **`natural-language-querying-nlq-for-everycent`** — chat interface on mobile is a downstream integration. NLQ phase 2 (chat UI) and mobile phase 3+ (Flutter) would need to coordinate on how chat works natively
- **Transaction import** — original idea mentioned getting transactions from bank's mobile app into everycent. Still an open problem. Copy-paste works on desktop; mobile needs a different approach (share sheet? photo of statement? paste from banking app?)
- **`transaction-fingerprinting-for-dedup`** (task) — the dedup problem is broader than mobile. ALL non-file-import transactions lack real identity (currently use random manual IDs). Fingerprinting work benefits mobile sync, MCP import, and existing web import. Captured as a standalone task.

---

## Open Questions / Things to Explore

- ~~Conflict resolution strategy for offline sync~~ → resolved: dedup via fingerprinting + flag for review
- Transaction import on mobile — what's the UX for getting bank data into the app on a phone?
- How much of the Flutter app's architecture transfers if you later build in React Native or native Kotlin?
- Should the Flutter app share the same `/api/mobile/` endpoints as a potential RN version, or do they diverge?
- How does Flutter handle streaming data (for chat) — is it native-feeling or does it fight the framework?
