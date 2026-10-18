// Models sometimes wrap JSON in markdown code fences even when asked not to
const CODE_FENCE = /^\s*```(?:json)?\s*|\s*```\s*$/g;

export function parseModelJson(raw: string): unknown {
  try {
    return JSON.parse(raw.replace(CODE_FENCE, ''));
  } catch {
    throw new Error('The AI model returned a response that could not be read');
  }
}
