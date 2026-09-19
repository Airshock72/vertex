import 'server-only'

import type { LanguageModel } from 'ai'
import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'

const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini'
const DEFAULT_ANTHROPIC_MODEL = 'claude-haiku-4-5'

// Resolves the search LLM from env so the provider can be switched without a code change.
// SEARCH_PROVIDER: "openai" (default) | "anthropic".
// SEARCH_MODEL is provider-specific — leave blank to use the provider's default.
// Provider SDKs read their own key from env (OPENAI_API_KEY / ANTHROPIC_API_KEY); no key handling here.
export function getSearchModel(): LanguageModel {
  const provider = process.env.SEARCH_PROVIDER?.trim().toLowerCase() || 'openai'
  const override = process.env.SEARCH_MODEL?.trim()

  switch (provider) {
    case 'openai':
      return openai(override || DEFAULT_OPENAI_MODEL)
    case 'anthropic':
      return anthropic(override || DEFAULT_ANTHROPIC_MODEL)
    default:
      throw new Error(`Unsupported SEARCH_PROVIDER: "${provider}" (expected "openai" or "anthropic")`)
  }
}
