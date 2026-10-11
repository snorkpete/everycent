# usage-band

A Claude Code mod that shows context-window fill and the 5-hour / weekly
usage windows, e.g. `ctx 38% (76k/200k) · 5h 23% ↻2h10m · 7d 41% ↻3d4h`.

Where it shows up:

- **Terminal / desktop app:** a coloured band above the prompt (yellow/red).
- **Status line:** same text, where the surface draws plugin status.
- **Every surface, including the mobile app:** a hidden per-prompt note asks
  Claude to end each reply with the current readout line (🟡 / 🔴 markers).
  The mobile app draws no mod UI, so this is the only thing that shows there.

Thresholds (edit `contextLevels` / `limitLevels` in `hooks/register.tsx`):

| Figure | Yellow | Red |
| --- | --- | --- |
| Context | above 45% | 65% and up |
| 5h / 7d usage | 60% and up | 80% and up |

## Install

From a terminal session in this repo:

```
/plugin install usage-band --marketplace ./
```

Notes: untested outside the session it was written in (no `claude plugin
validate` / `test` run). The hidden note makes Claude print the readout on
every reply; remove the `prompt.submit` hook to turn that off.
