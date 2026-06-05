import { PROVIDERS, AVAILABLE_MODELS } from '../config.js';
import { callAnthropic } from './anthropic.js';
import { callGemini } from './gemini.js';
import { getActiveModel } from '../utils/settings.js';

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
  // Let the underlying providers handle dynamic models
  switch (provider) {
    case PROVIDERS.ANTHROPIC:
      return callAnthropic(prompt, systemPrompt, apiKey, maxTokens);
    case PROVIDERS.GEMINI:
      return callGemini(prompt, systemPrompt, apiKey, maxTokens);
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
  const activeModelId = getActiveModel(provider);
  const models = AVAILABLE_MODELS[provider] || [];
  const modelConfig = models.find(m => m.id === activeModelId) || models[0];
  
  if (!modelConfig) return 0;
  
  return (inputTokens * modelConfig.input / 1_000_000) +
         (outputTokens * modelConfig.output / 1_000_000);
}
