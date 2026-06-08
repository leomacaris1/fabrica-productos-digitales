import { callLLM } from '../api/providers.js';
import { SYSTEM_PROMPTS } from '../config.js';
import { isTruncated } from '../utils/truncation.js';
import { getEffectiveSystemPrompt } from '../utils/settings.js';

/**
 * Continuation Agent - detects and fixes truncated content
 * @param {Object} options
 * @param {string} options.content - Potentially truncated content
 * @param {string} options.apiKey
 * @param {string} options.provider
 * @param {string} [options.language='es-latam']
 * @param {number} [options.maxPasses=3]
 * @param {function} [options.onContinuation] - Callback for each continuation pass
 * @returns {Promise<{text: string, totalInputTokens: number, totalOutputTokens: number, passes: number}>}
 */
export async function continueIfNeeded({ content, apiKey, provider, language = 'es-latam', maxPasses = 3, onContinuation, onRetry }) {
  let result = content;
  let passes = 0;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;

  while (isTruncated(result) && passes < maxPasses) {
    passes++;
    if (onContinuation) onContinuation(passes);

    const tail = result.trimEnd().slice(-400);
    const response = await callLLM({
      prompt: `El siguiente texto fue cortado abruptamente. Continúa EXACTAMENTE desde donde termina.
NO repitas nada del texto anterior. Empieza directo con lo que falta:

"...${tail}"

Continúa aquí:`,
      systemPrompt: getEffectiveSystemPrompt(language, SYSTEM_PROMPTS),
      apiKey,
      provider,
      maxTokens: 6000,
      onRetry,
    });

    result = result.trimEnd() + '\n' + response.text;
    totalInputTokens += response.inputTokens;
    totalOutputTokens += response.outputTokens;
  }

  return { text: result, totalInputTokens, totalOutputTokens, passes };
}
