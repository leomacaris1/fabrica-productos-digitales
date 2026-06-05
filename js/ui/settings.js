/**
 * Settings Panel Module (dashboard-ui-patterns + api-design-best-practices)
 *
 * Handles model selection, tone presets, and theme toggling.
 * Persists preferences in localStorage.
 */

import { MODEL_CATALOG, TONE_PRESETS, MODEL_CONFIG } from '../config.js';

const STORAGE_KEY = 'fabrica_settings';

/**
 * Load persisted settings from localStorage
 * @returns {Object} Settings object
 */
export function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : getDefaults();
  } catch {
    return getDefaults();
  }
}

/**
 * Save settings to localStorage
 * @param {Object} settings
 */
export function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

/**
 * Get default settings
 */
function getDefaults() {
  return {
    provider: 'anthropic',
    modelId: 'claude-haiku-4-5-20251001',
    tone: 'casual-latam',
    theme: 'dark',
  };
}

/**
 * Apply a model selection to the global MODEL_CONFIG
 * @param {string} provider
 * @param {string} modelId
 */
export function applyModelSelection(provider, modelId) {
  const catalog = MODEL_CATALOG[provider];
  if (!catalog) return;
  const model = catalog.find(m => m.id === modelId);
  if (!model) return;

  MODEL_CONFIG[provider].model = model.id;
  MODEL_CONFIG[provider].inputCostPer1M = model.inputCostPer1M;
  MODEL_CONFIG[provider].outputCostPer1M = model.outputCostPer1M;
}

/**
 * Apply theme (dark/light)
 * @param {'dark'|'light'} theme
 */
export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const settings = loadSettings();
  settings.theme = theme;
  saveSettings(settings);
}

/**
 * Toggle the current theme
 * @returns {string} The new theme
 */
export function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  return next;
}

/**
 * Render the full Settings panel HTML into a given container
 * @param {HTMLElement} container - The viewSettings div
 * @param {Function} onSave - Callback when settings are saved
 */
export function renderSettingsPanel(container, onSave) {
  const settings = loadSettings();

  container.innerHTML = `
    <div class="card glass-card animate-fade-up">
      <div class="card-header" style="display:flex;justify-content:space-between;align-items:center">
        <h2 style="font-size:14px; margin:0;">⚙️ Ajustes de la Fábrica</h2>
        <button class="btn-primary btn-sm" id="btnSaveSettings">💾 Guardar</button>
      </div>
      <div class="card-body" style="padding:16px;">

        <!-- Theme -->
        <div class="settings-section">
          <label class="settings-label">🌓 Tema</label>
          <div class="provider-select" style="display:inline-flex;">
            <button class="provider-option ${settings.theme === 'dark' ? 'active' : ''}" data-theme-opt="dark">🌙 Oscuro</button>
            <button class="provider-option ${settings.theme === 'light' ? 'active' : ''}" data-theme-opt="light">☀️ Claro</button>
          </div>
        </div>

        <!-- Model Selection -->
        <div class="settings-section" style="margin-top:20px;">
          <label class="settings-label">🤖 Modelo de IA</label>
          <p style="font-size:10px;color:var(--text-muted);margin-bottom:10px;">Elige el modelo que usará el orquestador para generar contenido.</p>

          <!-- Anthropic models -->
          <div class="settings-subsection">
            <span class="settings-sublabel">Claude (Anthropic)</span>
            <div class="model-grid" id="modelGridAnthropic">
              ${MODEL_CATALOG.anthropic.map(m => `
                <button class="model-option ${settings.provider === 'anthropic' && settings.modelId === m.id ? 'active' : ''}"
                        data-provider="anthropic" data-model-id="${m.id}">
                  <span class="model-name">${m.label}</span>
                  <span class="model-speed">${m.speed === 'fast' ? '⚡' : m.speed === 'balanced' ? '⚖️' : '🧠'} ${m.speed}</span>
                  <span class="model-cost">$${m.inputCostPer1M}/M in · $${m.outputCostPer1M}/M out</span>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Gemini models -->
          <div class="settings-subsection" style="margin-top:12px;">
            <span class="settings-sublabel">Gemini (Google)</span>
            <div class="model-grid" id="modelGridGemini">
              ${MODEL_CATALOG.gemini.map(m => `
                <button class="model-option ${settings.provider === 'gemini' && settings.modelId === m.id ? 'active' : ''}"
                        data-provider="gemini" data-model-id="${m.id}">
                  <span class="model-name">${m.label}</span>
                  <span class="model-speed">${m.speed === 'fast' ? '⚡' : '🧠'} ${m.speed}</span>
                  <span class="model-cost">$${m.inputCostPer1M}/M in · $${m.outputCostPer1M}/M out</span>
                </button>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Tone Presets -->
        <div class="settings-section" style="margin-top:20px;">
          <label class="settings-label">🎭 Tono de Escritura</label>
          <p style="font-size:10px;color:var(--text-muted);margin-bottom:10px;">Define el estilo de comunicación del contenido generado.</p>
          <div class="tone-grid">
            ${TONE_PRESETS.map(t => `
              <button class="tone-option ${settings.tone === t.id ? 'active' : ''}" data-tone="${t.id}">
                <span class="tone-label">${t.label}</span>
                <span class="tone-desc">${t.desc}</span>
              </button>
            `).join('')}
          </div>
        </div>

      </div>
    </div>
  `;

  // ─── Event Listeners ─────────────────────────────────────────────────
  let tempSettings = { ...settings };

  // Theme buttons
  container.querySelectorAll('[data-theme-opt]').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('[data-theme-opt]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      tempSettings.theme = btn.dataset.themeOpt;
      applyTheme(tempSettings.theme);
    });
  });

  // Model buttons
  container.querySelectorAll('.model-option').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.model-option').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      tempSettings.provider = btn.dataset.provider;
      tempSettings.modelId = btn.dataset.modelId;
    });
  });

  // Tone buttons
  container.querySelectorAll('.tone-option').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.tone-option').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      tempSettings.tone = btn.dataset.tone;
    });
  });

  // Save
  container.querySelector('#btnSaveSettings').addEventListener('click', () => {
    saveSettings(tempSettings);
    applyModelSelection(tempSettings.provider, tempSettings.modelId);
    onSave?.(tempSettings);
  });
}
