import { PROVIDERS, MODEL_CONFIG } from '../config.js';
import { callAnthropic } from './anthropic.js';
import { callGemini } from './gemini.js';

/**
 * Unified LLM call - routes to the correct provider
 * @param {Object} options
 * @param {string} options.prompt
 * @param {string} options.systemPrompt
 * @param {string} options.apiKey
 * @param {string} options.provider - 'anthropic' or 'gemini'
 * @param {number} [options.maxTokens]
 * @returns {Promise<{text: string, inputTokens: number, outputTokens: number}>}
 */
export async function callLLM({ prompt, systemPrompt, apiKey, provider, maxTokens }) {
  const config = MODEL_CONFIG[provider];
  const tokens = maxTokens || config.maxTokens;

  switch (provider) {
    case PROVIDERS.ANTHROPIC:
      return callAnthropic(prompt, systemPrompt, apiKey, tokens);
    case PROVIDERS.GEMINI:
      return callGemini(prompt, systemPrompt, apiKey, tokens);
    default:
      throw new Error(`Provider desconocido: ${provider}`);
  }
}

/**
 * Calculate cost for tokens
 * @param {string} provider
 * @param {number} inputTokens
 * @param {number} outputTokens
 * @returns {number} Cost in USD
 */
export function calculateCost(provider, inputTokens, outputTokens) {
  const config = MODEL_CONFIG[provider];
  return (inputTokens * config.inputCostPer1M / 1_000_000) +
         (outputTokens * config.outputCostPer1M / 1_000_000);
}
