# Idea: Redesign EverycentApp UI using Google Stitch

**Captured:** 2026-03-28
**Status:** raw

---

## The Idea

Once the Vue 3 + PrimeVue migration is complete, use Google Stitch to generate a fresh visual design for EverycentApp. Stitch produces high-fidelity UI screens from natural language descriptions and exports HTML/CSS (Tailwind), React/JSX, and Figma files. The exported designs would serve as the visual target for the Vue frontend — not a framework swap, but a new coat of paint.

---

## Why This Is Worth Doing

The current UI is functional but developer-designed. A tool like Stitch lowers the barrier to a professional-looking interface without needing a designer. Since the Vue migration is already modernising the codebase, layering a visual refresh on top makes the most of that investment.

---

## Open Questions / Things to Explore

- Stitch exports React/HTML — how well does that translate to Vue 3 + PrimeVue components? Manual conversion or LLM-assisted?
- Does PrimeVue's theming system (design tokens, presets) make it easier to apply Stitch's visual direction without rewriting components?
- Should Stitch generate screen-by-screen designs, or a design system (colours, typography, spacing) that gets applied globally?
- Which screens matter most for a first pass — dashboard? budget editor? transaction list?
- Timing: how far along does the Vue migration need to be before this makes sense?
