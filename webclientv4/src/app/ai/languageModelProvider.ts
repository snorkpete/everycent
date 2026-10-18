import type { LanguageModelProvider } from './languageModel.types';
import { browserLanguageModel } from './browserLanguageModel';

/**
 * The single place that decides which model backs AI features.
 * To add another provider (e.g. Ollama), implement LanguageModelProvider and
 * choose between providers here (for instance from a user setting).
 */
export function getLanguageModelProvider(): LanguageModelProvider {
  return browserLanguageModel;
}
