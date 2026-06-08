import { fetchWithRetry } from './retry.js';
import { getActiveModel, loadSettings } from '../utils/settings.js';

/**
 * Call a local Ollama instance (OpenAI-compatible /v1/chat/completions)
 * Requires Ollama running locally: https://ollama.ai
 * @param {string} prompt
 * @param {string} systemPrompt
 * @param {string} _apiKey - Not used for local Ollama, kept for interface consistency
 * @param {number} maxTokens
 * @param {Function} [onRetry]
 * @returns {Promise<{text: string, inputTokens: number, outputTokens: number}>}
 */
export async function callOllama(prompt, systemPrompt, _apiKey, maxTokens = 8000, onRetry) {
  const settings = loadSettings();
  const activeModelId = getActiveModel('ollama');
  const baseUrl = settings.ollamaEndpoint || 'http://localhost:11434';
  const endpoint = `${baseUrl}/v1/chat/completions`;

  let response;
  try {
    response = await fetchWithRetry(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: activeModelId,
        max_tokens: maxTokens,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        stream: false,
      }),
    }, { onRetry, maxRetries: 2 });
  } catch (networkError) {
    throw new Error(
      `No se pudo conectar a Ollama en ${baseUrl}. ` +
      `Asegurate de tener Ollama instalado y corriendo. ` +
      `Error original: ${networkError.message}`
    );
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(`Ollama error: ${data.error.message || JSON.stringify(data.error)}`);
  }

  const choice = data.choices?.[0];
  if (!choice) throw new Error('No response from Ollama');

  return {
    text: choice.message?.content || '',
    // Ollama doesn't always return token counts, estimate safely
    inputTokens: data.usage?.prompt_tokens || 0,
    outputTokens: data.usage?.completion_tokens || 0,
  };
}
