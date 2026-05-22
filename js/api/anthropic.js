import { MODEL_CONFIG } from '../config.js';

/**
 * Call Anthropic Claude API
 * @param {string} prompt - User prompt
 * @param {string} systemPrompt - System prompt
 * @param {string} apiKey - API key
 * @param {number} maxTokens - Max output tokens
 * @returns {Promise<{text: string, inputTokens: number, outputTokens: number}>}
 */
export async function callAnthropic(prompt, systemPrompt, apiKey, maxTokens = 8000) {
  const config = MODEL_CONFIG.anthropic;
  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message);

  return {
    text: data.content[0].text,
    inputTokens: data.usage?.input_tokens || 0,
    outputTokens: data.usage?.output_tokens || 0,
  };
}
