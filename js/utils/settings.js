/**
 * Settings Manager — Persists user preferences in localStorage
 */
const SETTINGS_KEY = 'fabrica_settings';

const DEFAULTS = {
  // Provider & Model
  provider: 'anthropic',
  model: {
    anthropic: 'claude-haiku-4-5-20251001',
    gemini: 'gemini-2.5-flash',
    openrouter: 'meta-llama/llama-3.1-8b-instruct:free',
    ollama: 'llama3.1',
  },

  // Credentials
  openrouterApiKey: '',
  ollamaEndpoint: 'http://localhost:11434',

  // Prompt cache
  cacheEnabled: false,

  // Budget
  maxBudget: 1.00,

  // Tone
  tone: 'profesional', // profesional | casual | emocional | directo

  // Custom system prompts (null = use defaults from config.js)
  customSystemPrompt: {
    'es-latam': null,
    'en-us': null,
  },
  customQAPrompt: {
    'es-latam': null,
    'en-us': null,
  },

  // UI
  theme: 'dark', // dark | light
};

/**
 * Deep merge two objects (shallow-ish, 2 levels)
 */
function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === 'object'
    ) {
      result[key] = { ...target[key], ...source[key] };
    } else if (source[key] !== undefined) {
      result[key] = source[key];
    }
  }
  return result;
}

/**
 * Load settings from localStorage (merged with defaults)
 * @returns {Object}
 */
export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULTS };
    const saved = JSON.parse(raw);
    return deepMerge(DEFAULTS, saved);
  } catch {
    return { ...DEFAULTS };
  }
}

/**
 * Save settings to localStorage
 * @param {Object} settings - Full or partial settings object
 */
export function saveSettings(settings) {
  try {
    const current = loadSettings();
    const merged = deepMerge(current, settings);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
    return merged;
  } catch (e) {
    console.warn('Could not save settings:', e);
  }
}

/**
 * Get the active model string for the current provider
 * @param {string} [provider] - Override provider, else use saved
 * @returns {string}
 */
export function getActiveModel(provider) {
  const s = loadSettings();
  const p = provider || s.provider;
  return s.model[p] || DEFAULTS.model[p];
}

/**
 * Get the active tone modifier string to append to system prompts
 * @returns {string}
 */
export function getToneModifier() {
  const s = loadSettings();
  const toneMap = {
    profesional: '',
    casual: '\n8. TONO: Usa un tono casual, relajado y cercano. Como si hablaras con un amigo emprendedor.',
    emocional: '\n8. TONO: Usa un tono altamente emocional, inspirador y motivacional. Conecta con el dolor y el deseo del lector.',
    directo: '\n8. TONO: Sé extremadamente directo y conciso. Cero adornos. Ve al grano con datos, beneficios y pasos.',
  };
  return toneMap[s.tone] || '';
}

/**
 * Get the effective system prompt (custom or default + tone)
 * @param {string} language - 'es-latam' or 'en-us'
 * @param {Object} defaultPrompts - SYSTEM_PROMPTS from config.js
 * @returns {string}
 */
export function getEffectiveSystemPrompt(language, defaultPrompts) {
  const s = loadSettings();
  const custom = s.customSystemPrompt[language];
  const base = custom || defaultPrompts[language];
  return base + getToneModifier();
}

/**
 * Get the effective QA prompt (custom or default)
 * @param {string} language
 * @param {Object} defaultQAPrompts - QA_SYSTEM_PROMPTS from config.js
 * @returns {string}
 */
export function getEffectiveQAPrompt(language, defaultQAPrompts) {
  const s = loadSettings();
  return s.customQAPrompt[language] || defaultQAPrompts[language];
}

/**
 * Get current theme
 * @returns {'dark'|'light'}
 */
export function getTheme() {
  return loadSettings().theme;
}

/**
 * Toggle theme and persist
 * @returns {'dark'|'light'} The new theme
 */
export function toggleTheme() {
  const s = loadSettings();
  const newTheme = s.theme === 'dark' ? 'light' : 'dark';
  saveSettings({ theme: newTheme });
  return newTheme;
}
