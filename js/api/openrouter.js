import { fetchWithRetry } from './retry.js';
import { AVAILABLE_MODELS } from '../config.js';
import { getActiveModel } from '../utils/settings.js';

/**
 * Call OpenRouter API (OpenAI-compatible format)
 * Compatible with all models on https://openrouter.ai/models
 * @param {string} prompt
 * @param {string} systemPrompt
 * @param {string} apiKey - OpenRouter API Key
 * @param {number} maxTokens
 * @param {Function} [onRetry]
 * @returns {Promise<{text: string, inputTokens: number, outputTokens: number}>}
 */
export async function callOpenRouter(prompt, systemPrompt, apiKey, maxTokens = 8000, onRetry) {
  const activeModelId = getActiveModel('openrouter');
  const endpoint = 'https://openrouter.ai/api/v1/chat/completions';

  const response = await fetchWithRetry(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://fabrica-digital.app',
      'X-Title': 'Fábrica de Productos Digitales',
    },
    body: JSON.stringify({
      model: activeModelId,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
    }),
  }, { onRetry });

  const data = await response.json();

  if (data.error) {
    throw new Error(`OpenRouter error: ${data.error.message || JSON.stringify(data.error)}`);
  }

  const choice = data.choices?.[0];
  if (!choice) throw new Error('No response from OpenRouter');

  return {
    text: choice.message?.content || '',
    inputTokens: data.usage?.prompt_tokens || 0,
    outputTokens: data.usage?.completion_tokens || 0,
  };
}
