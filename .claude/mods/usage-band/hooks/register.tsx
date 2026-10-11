import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Limit, Reading } from '../types'

const reading = atom({ plugin: 'usage-band', key: 'reading' } as const, null)

type Source = {
  context: { tokens?: number; window: number; percent?: number | null }
  rateLimits: readonly Limit[]
}

const toReading = ({ context, rateLimits }: Source): Reading => ({
  tokens: context.tokens ?? null,
  window: context.window,
  percent: context.percent ?? null,
  limits: rateLimits.map(l => ({
    kind: l.kind,
    percentUsed: l.percentUsed,
    resetsAt: l.resetsAt,
  })),
})

const kilo = (n: number): string =>
  n >= 1000 ? `${Math.round(n / 1000)}k` : String(n)

const labels: Record<string, string> = {
  five_hour: '5h',
  seven_day: '7d',
  spend_limit: 'spend',
}

const until = (iso: string | undefined, now: number): string => {
  if (!iso) return ''
  const mins = Math.max(0, Math.round((Date.parse(iso) - now) / 60000))
  if (mins >= 1440) return ` ↻${Math.floor(mins / 1440)}d${Math.floor((mins % 1440) / 60)}h`
  if (mins >= 60) return ` ↻${Math.floor(mins / 60)}h${mins % 60}m`
  return ` ↻${mins}m`
}

const bar = (percent: number): string => {
  const filled = Math.max(0, Math.min(8, Math.round((percent / 100) * 8)))
  return '█'.repeat(filled) + '░'.repeat(8 - filled)
}

type Thresholds = { yellow: number; red: number }

const contextLevels: Thresholds = { yellow: 45, red: 65 }
const limitLevels: Thresholds = { yellow: 60, red: 80 }

const color = (percent: number, t: Thresholds): 'red' | 'yellow' | undefined =>
  percent >= t.red ? 'red' : percent > t.yellow ? 'yellow' : undefined

const mark = (percent: number, t: Thresholds): string =>
  percent >= t.red ? '🔴 ' : percent > t.yellow ? '🟡 ' : ''

const summary = (r: Reading, now: number): string => {
  const ctx =
    r.percent === null
      ? 'ctx –'
      : `${mark(r.percent, contextLevels)}ctx ${r.percent}%`
  const size = r.tokens === null ? '' : ` (${kilo(r.tokens)}/${kilo(r.window)})`
  const limits = r.limits.map(
    l =>
      `${mark(l.percentUsed, limitLevels)}${labels[l.kind] ?? l.kind} ${Math.round(l.percentUsed)}%${until(l.resetsAt, now)}`,
  )

  return [ctx + size, ...limits].join(' · ')
}

const readoutNote = (line: string): string =>
  `[usage-band mod, set up by the user at their request] Usage readout as of the previous response: ${line}\n` +
  'The user asked to see this at the end of every reply. End your reply with this exact line on its own, ' +
  `in italics: *${line}*`

async function refresh($: EngineInterface, source?: Source): Promise<void> {
  const next = toReading(source ?? (await $.session.usage()))
  await update($, reading, () => next)
  const line = summary(next, await $.clock.now())
  $.ui.status(line)
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await refresh($)

    return next(e)
  })

  on('session.measure', async ($, e, next) => {
    await refresh($, e)

    return next(e)
  })

  on('prompt.submit', async ($, e, next) => {
    const usage = await $.session.usage()
    await refresh($, usage)
    const line = summary(toReading(usage), await $.clock.now())

    return next({
      ...e,
      context: [...(e.context ?? []), readoutNote(line)],
    })
  })

  on('turn.complete', async ($, e, next) => {
    const usage = await $.session.usage()
    await refresh($, usage)
    $.ui.log(summary(toReading(usage), await $.clock.now()))

    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const stored = await read($, reading)

    if (e.props.hasSurvey) {
      return next(e)
    }

    const r = stored ?? toReading(await $.session.usage())
    const now = await $.clock.now()
    const { Box, Text } = $.ui.resolve(e)
    const ctx = r.percent ?? 0

    return (
      <Box>
        <Text color={color(ctx, contextLevels)}>
          ctx {bar(ctx)} {r.percent === null ? '–' : `${ctx}%`}
          {r.tokens === null ? '' : ` (${kilo(r.tokens)}/${kilo(r.window)})`}
        </Text>
        {r.limits.map(l => (
          <Text key={l.kind} color={color(l.percentUsed, limitLevels)}>
            {'  '}
            {labels[l.kind] ?? l.kind} {bar(l.percentUsed)} {Math.round(l.percentUsed)}%
            {until(l.resetsAt, now)}
          </Text>
        ))}
      </Box>
    )
  })
}
