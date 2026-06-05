import { callLLM } from '../api/providers.js';
import { SYSTEM_PROMPTS } from '../config.js';
import { getEffectiveSystemPrompt } from '../utils/settings.js';

/**
 * Writer Agent - generates content from prompts
 * @param {Object} options
 * @param {string} options.prompt
 * @param {string} options.apiKey
 * @param {string} options.provider
 * @param {string} [options.language='es-latam']
 * @param {number} [options.maxTokens]
 * @returns {Promise<{text: string, inputTokens: number, outputTokens: number}>}
 */
export async function writerGenerate({ prompt, apiKey, provider, language = 'es-latam', maxTokens }) {
  return callLLM({
    prompt,
    systemPrompt: getEffectiveSystemPrompt(language, SYSTEM_PROMPTS),
    apiKey,
    provider,
    maxTokens,
  });
}
