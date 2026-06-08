/**
 * Prompt Cache Module
 * Saves LLM responses keyed by a hash of prompt + systemPrompt + model.
 * Uses sessionStorage to avoid persisting across sessions (opt-in to localStorage via settings).
 */

const CACHE_PREFIX = 'llm_cache_';

/**
 * Fast, non-cryptographic hash for prompt fingerprinting.
 * @param {string} str
 * @returns {string}
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit int
  }
  return Math.abs(hash).toString(36);
}

/**
 * Build a cache key from the prompt context.
 * @param {string} prompt
 * @param {string} systemPrompt
 * @param {string} model
 * @returns {string}
 */
function buildKey(prompt, systemPrompt, model) {
  const raw = `${model}::${systemPrompt}::${prompt}`;
  return CACHE_PREFIX + hashString(raw);
}

/**
 * Get a cached response if it exists.
 * @param {string} prompt
 * @param {string} systemPrompt
 * @param {string} model
 * @param {boolean} [useSession=true] Use sessionStorage (clears on tab close); set false for localStorage
 * @returns {{ text: string, inputTokens: number, outputTokens: number } | null}
 */
export function getCache(prompt, systemPrompt, model, useSession = true) {
  try {
    const store = useSession ? sessionStorage : localStorage;
    const key = buildKey(prompt, systemPrompt, model);
    const raw = store.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Store a response in cache.
 * @param {string} prompt
 * @param {string} systemPrompt
 * @param {string} model
 * @param {{ text: string, inputTokens: number, outputTokens: number }} result
 * @param {boolean} [useSession=true]
 */
export function setCache(prompt, systemPrompt, model, result, useSession = true) {
  try {
    const store = useSession ? sessionStorage : localStorage;
    const key = buildKey(prompt, systemPrompt, model);
    store.setItem(key, JSON.stringify({ ...result, _cached: true, _ts: Date.now() }));
  } catch {
    // Ignore QuotaExceededError silently
  }
}

/**
 * Clear all cached LLM responses.
 * @param {boolean} [useSession=true]
 */
export function clearCache(useSession = true) {
  try {
    const store = useSession ? sessionStorage : localStorage;
    const keysToRemove = [];
    for (let i = 0; i < store.length; i++) {
      const key = store.key(i);
      if (key?.startsWith(CACHE_PREFIX)) keysToRemove.push(key);
    }
    keysToRemove.forEach(k => store.removeItem(k));
    return keysToRemove.length;
  } catch {
    return 0;
  }
}

/**
 * Check if a response came from cache.
 * @param {{ _cached?: boolean }} result
 * @returns {boolean}
 */
export function isCachedResult(result) {
  return result?._cached === true;
}
