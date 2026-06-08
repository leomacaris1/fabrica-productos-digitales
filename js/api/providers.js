import { PROVIDERS, AVAILABLE_MODELS } from '../config.js';
import { callAnthropic } from './anthropic.js';
import { callGemini } from './gemini.js';
import { callOpenRouter } from './openrouter.js';
import { callOllama } from './ollama.js';
import { getActiveModel, loadSettings } from '../utils/settings.js';
import { getCache, setCache, isCachedResult } from '../utils/cache.js';

/**
 * Unified LLM call — routes to the correct provider with optional prompt caching.
 * @param {Object} options
 * @param {string} options.prompt
 * @param {string} options.systemPrompt
 * @param {string} options.apiKey
 * @param {string} options.provider - 'anthropic' | 'gemini' | 'openrouter' | 'ollama'
 * @param {number} [options.maxTokens]
 * @param {Function} [options.onRetry]
 * @returns {Promise<{text: string, inputTokens: number, outputTokens: number}>}
 */
export async function callLLM({ prompt, systemPrompt, apiKey, provider, maxTokens, onRetry }) {
  const settings = loadSettings();
  const cacheEnabled = settings.cacheEnabled === true;
  const activeModelId = getActiveModel(provider);

  // ── Cache read ──────────────────────────────────────────────────────────
  if (cacheEnabled) {
    const cached = getCache(prompt, systemPrompt, activeModelId);
    if (cached) {
      return cached; // Instant reply, zero tokens consumed
    }
  }

  // ── Route to provider with Fallback ──────────────────────────────────────
  let result;
  try {
    switch (provider) {
      case PROVIDERS.ANTHROPIC:
        result = await callAnthropic(prompt, systemPrompt, apiKey, maxTokens, onRetry);
        break;
      case PROVIDERS.GEMINI:
        result = await callGemini(prompt, systemPrompt, apiKey, maxTokens, onRetry);
        break;
      case PROVIDERS.OPENROUTER: {
        const orKey = settings.openrouterApiKey || apiKey;
        try {
          result = await callOpenRouter(prompt, systemPrompt, orKey, maxTokens, onRetry);
        } catch (error) {
          // Fallback Automático para OpenRouter (Modelos gratuitos)
          console.warn(`[Fallback] Error con el modelo principal de OpenRouter: ${error.message}. Intentando con Qwen 2.5 7B gratuito...`);
          if (onRetry) onRetry('fallback', 1, 0, error); // Notify UI loosely
          
          // Cambiamos temporalmente el activeModelId para la caché si tiene éxito
          const fallbackModel = 'qwen/qwen-2.5-7b-instruct:free';
          const originalGetActiveModel = settings.model.openrouter;
          settings.model.openrouter = fallbackModel;
          
          try {
            result = await callOpenRouter(prompt, systemPrompt, orKey, maxTokens, null); // Sin onRetry interno para el fallback inmediato
          } catch (fallbackError) {
             console.warn(`[Fallback] Qwen también falló: ${fallbackError.message}. Intentando Gemma 2 9B gratuito...`);
             settings.model.openrouter = 'google/gemma-2-9b-it:free';
             result = await callOpenRouter(prompt, systemPrompt, orKey, maxTokens, null);
          }
        }
        break;
      }
      case PROVIDERS.OLLAMA:
        result = await callOllama(prompt, systemPrompt, apiKey, maxTokens, onRetry);
        break;
      default:
        throw new Error(`Provider desconocido: ${provider}`);
    }
  } catch (error) {
    throw error; // Re-throw si fallaron todos los fallbacks o si es un provider sin fallback aún
  }

  // ── Cache write ─────────────────────────────────────────────────────────
  if (cacheEnabled && result) {
    // Usamos el modelo real que funcionó (puede ser el fallback)
    const effectiveModelId = provider === PROVIDERS.OPENROUTER ? settings.model.openrouter : activeModelId;
    setCache(prompt, systemPrompt, effectiveModelId, result);
  }

  return result;
}

/**
 * Calculate cost for tokens using the active model's pricing.
 * Returns $0 for free/local models.
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

  return (inputTokens * (modelConfig.input || 0) / 1_000_000) +
         (outputTokens * (modelConfig.output || 0) / 1_000_000);
}
