import { callLLM } from '../api/providers.js';
import { QA_SYSTEM_PROMPTS } from '../config.js';
import { getEffectiveQAPrompt } from '../utils/settings.js';

/**
 * QA Agent - reviews content for completeness
 * @param {Object} options
 * @param {string} options.content - Content to review
 * @param {string} options.contextStr - Context about what this content should contain
 * @param {string} options.apiKey
 * @param {string} options.provider
 * @param {string} [options.language='es-latam']
 * @returns {Promise<{text: string, inputTokens: number, outputTokens: number, wasFixed: boolean}>}
 */
export async function qaReview({ content, contextStr, apiKey, provider, language = 'es-latam' }) {
  const prompt = `Contexto del producto: ${contextStr}

Revisa el siguiente contenido. Detecta si hay:
- Listas incompletas (ej: "10 ideas" pero solo hay 6)
- Tablas cortadas a la mitad
- Secciones que terminan abruptamente o con "..."
- Oraciones sin terminar
- Ítems numerados faltantes

Si el contenido está COMPLETO: responde exactamente con el texto original, sin cambios.
Si hay partes INCOMPLETAS: completa SOLO las partes faltantes y devuelve el contenido completo y pulido.

CONTENIDO A REVISAR:
---
${content}
---`;

  const result = await callLLM({
    prompt,
    systemPrompt: getEffectiveQAPrompt(language, QA_SYSTEM_PROMPTS),
    apiKey,
    provider,
    maxTokens: 8000,
  });

  // Heuristic: if QA response is significantly different in length, content was fixed
  const lengthDiff = Math.abs(result.text.length - content.length);
  const wasFixed = lengthDiff > content.length * 0.1; // more than 10% change

  return { ...result, wasFixed };
}
