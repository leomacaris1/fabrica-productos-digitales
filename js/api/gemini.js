import { MODEL_CONFIG } from '../config.js';
import { fetchWithRetry } from './retry.js';
import { getActiveModel } from '../utils/settings.js';

/**
 * Call Google Gemini API
 * @param {string} prompt - User prompt
 * @param {string} systemPrompt - System prompt
 * @param {string} apiKey - API key
 * @param {number} maxTokens - Max output tokens
 * @returns {Promise<{text: string, inputTokens: number, outputTokens: number}>}
 */
export async function callGemini(prompt, systemPrompt, apiKey, maxTokens = 8192) {
  const config = MODEL_CONFIG.gemini;
  const activeModelId = getActiveModel('gemini');
  const url = `${config.endpoint}/${activeModelId}:generateContent?key=${apiKey}`;

  const response = await fetchWithRetry(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: 0.7,
        topP: 0.9,
      }
    })
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message || 'Gemini API error');

  const candidate = data.candidates?.[0];
  if (!candidate) throw new Error('No response from Gemini');

  return {
    text: candidate.content.parts[0].text,
    inputTokens: data.usageMetadata?.promptTokenCount || 0,
    outputTokens: data.usageMetadata?.candidatesTokenCount || 0,
  };
}
