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
export async function callGemini(prompt, systemPrompt, apiKey, maxTokens = 8192, onRetry) {
  const config = MODEL_CONFIG.gemini;
  const activeModelId = getActiveModel('gemini');
  const url = `${config.endpoint}/${activeModelId}:generateContent?key=${apiKey}`;

  const response = await fetchWithRetry(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ parts: [{ text: prompt }] }],
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
      ],
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: 0.7,
        topP: 0.9,
      }
    })
  }, { onRetry });

  const data = await response.json();
  // Validamos si falló por safety u otra cosa
  if (data.error) throw new Error(data.error.message || 'Gemini API error');

  const candidate = data.candidates?.[0];
  if (!candidate) {
    if (data.promptFeedback?.blockReason) {
      throw new Error(`Gemini bloqueó el prompt: ${data.promptFeedback.blockReason}`);
    }
    throw new Error('No response from Gemini (Possible Safety Block or empty response)');
  }

  // Verifica si el output fue truncado por filtros de seguridad a la mitad
  if (candidate.finishReason === 'SAFETY') {
    throw new Error('Gemini truncó la respuesta debido a Safety Filters.');
  }

  return {
    text: candidate.content.parts[0].text,
    inputTokens: data.usageMetadata?.promptTokenCount || 0,
    outputTokens: data.usageMetadata?.candidatesTokenCount || 0,
  };
}
