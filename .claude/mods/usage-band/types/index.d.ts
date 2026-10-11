export type Limit = { kind: string; percentUsed: number; resetsAt?: string }
export type Reading = {
  tokens: number | null
  window: number
  percent: number | null
  limits: Limit[]
}

declare module 'claude-code' {
  interface PluginState {
    'usage-band': { reading: Reading | null }
  }
}
