# Vocabulary Instructions

## Loading
- At conversation start, read `vocabulary/vocabulary.md` to load all word definitions.
- When working on a feature, debugging, or discussing a domain concept, read the relevant detail files (`vocabulary/<word>.md`) for context on intent, history, and expected behavior.
- Use vocabulary definitions as the source of truth for what domain terms mean. If code behavior diverges from a word's contract, that's a potential bug — flag it.

## Updating
Vocabulary is a living document. Update it as new information surfaces in conversation.

**Do directly (no confirmation needed):**
- Clarifying or improving wording in context/gotchas sections
- Adding new gotchas or context discovered during work
- Fixing factual errors you can verify in code
- Updating status (e.g., partial → dead) when confirmed by the user

**Propose first (get user confirmation):**
- Adding a new vocabulary word
- Changing a definition (the compressed meaning in vocabulary.md)
- Changing a contract (how something is supposed to work)
- Removing a word

When updating, always update both the detail `.md` file and the `vocabulary.md` index entry if the definition changed.

## Growing the vocabulary
- If a concept keeps coming up in conversation that isn't captured, propose it as a new word.
- Look for opportunities to compose existing words into higher-level concepts — vocabulary words are functions of meaning that compose. The goal is to express more with fewer words over time.
- The vocabulary is also a transparency tool: the user can see what each word means to you, catch misconceptions early, and correct them. When proposing or updating, be specific about your understanding so divergences are visible.
