// CSS imports (Vite handles these)
import '../css/design-tokens.css';
import '../css/layout.css';
import '../css/components.css';
import '../css/animations.css';

// Core imports
import { STEPS, PROVIDERS } from './config.js';
import { runWorkflow, runAdaptationWorkflow } from './agents/orchestrator.js';
import { downloadAllMd, downloadAllJson, downloadStep } from './utils/download.js';
import { generateSessionId, saveSession, loadSession, getLatestSessionId, listSessions, deleteSession } from './utils/session.js';
import { renderPipeline, updatePipelineNode } from './ui/pipeline.js';
import { renderStepCards, updateStepCard } from './ui/step-card.js';
import { addLog, clearLog } from './ui/log-panel.js';
import { updateProgress, showProgress, hideProgress } from './ui/progress.js';
import { updateStats } from './ui/stats-bar.js';
import { StudioPanel } from './ui/studio-panel.js';
import { toast } from './ui/toast.js';
import { loadSettings, saveSettings, getTheme, toggleTheme } from './utils/settings.js';
import { AVAILABLE_MODELS } from './config.js';

// ─── State ───────────────────────────────────────────────────────────────
let currentProvider = PROVIDERS.ANTHROPIC;
let results = {};
let context = {};
let sessionId = null;
let isRunning = false;
let studioPanel = null;

// ─── DOM References ──────────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);

// ─── Clock ───────────────────────────────────────────────────────────────
function updateClock() {
  const now = new Date();
  $('clock').textContent = now.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
setInterval(updateClock, 1000);

// ─── Provider Switching ──────────────────────────────────────────────────
function initProviderSelect() {
  const buttons = document.querySelectorAll('.provider-option');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (isRunning) return;
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentProvider = btn.dataset.provider;

      // Update API key placeholder and hint
      const apiInput = $('apiKey');
      const apiHint = $('apiHint');
      const apiLink = $('apiLink');

      if (currentProvider === PROVIDERS.GEMINI) {
        apiInput.placeholder = 'AIzaSy...';
        apiLink.href = 'https://aistudio.google.com/apikey';
        apiLink.textContent = 'aistudio.google.com/apikey';
      } else {
        apiInput.placeholder = 'sk-ant-api03-...';
        apiLink.href = 'https://console.anthropic.com/keys';
        apiLink.textContent = 'console.anthropic.com/keys';
      }
    });
  });
}

// ─── Sidebar Steps ───────────────────────────────────────────────────────
function renderSidebarSteps() {
  const container = $('sidebarSteps');
  container.innerHTML = STEPS.map(s => `
    <div class="sidebar-item" id="sidebar-step-${s.id}" data-step="${s.id}">
      <span class="sidebar-icon sidebar-step-icon" id="sidebar-ico-${s.id}">◻️</span>
      <span class="sidebar-text">${s.emoji} ${s.title}</span>
    </div>
  `).join('');
}

// ─── Workflow Callbacks ──────────────────────────────────────────────────
function getCallbacks() {
  return {
    onStepStart(stepId, label) {
      updateStepCard(stepId, 'active', label);
      updatePipelineNode(stepId, 'active');
      const sidebarIco = $(`sidebar-ico-${stepId}`);
      if (sidebarIco) sidebarIco.textContent = '⏳';
      $('statusText').textContent = `PASO ${stepId}/10`;
    },

    onStepQA(stepId) {
      updateStepCard(stepId, 'qa', 'QA revisando...');
      updatePipelineNode(stepId, 'qa');
    },

    onStepContinuation(stepId, pass) {
      updateStepCard(stepId, 'continuation', `continuando (${pass})...`);
    },

    onStepComplete(stepId, content, validation) {
      results[stepId] = content;
      updateStepCard(stepId, 'done', '', content, validation);
      updatePipelineNode(stepId, 'done');
      const sidebarIco = $(`sidebar-ico-${stepId}`);
      if (sidebarIco) sidebarIco.textContent = '✅';
    },

    onLog(message, type) {
      $('logPanel').style.display = 'block';
      addLog(message, type);
    },

    onRetry(stepId, attempt, delay, error) {
      const sec = (delay / 1000).toFixed(0);
      toast.warning(`Reintentando paso ${stepId} (intento ${attempt} en ${sec}s...)`);
    },

    onProgress(step, total) {
      updateProgress(step, total);
    },

    onStats(stats) {
      updateStats(stats);
      $('sidebarStats').style.display = 'block';
      $('statTokensIn').textContent = stats.inputTokens.toLocaleString();
      $('statTokensOut').textContent = stats.outputTokens.toLocaleString();
      $('statCost').textContent = '$' + stats.cost.toFixed(4);
      $('statCalls').textContent = stats.calls;
      $('statCont').textContent = stats.continuations;
      $('statQA').textContent = stats.qaFixes;
    },

    onError(error) {
      $('errorBox').textContent = 'Error: ' + error.message + ' — Revisá tu API key e intentá de nuevo.';
      $('errorBox').style.display = 'block';
      hideProgress();
      $('statusPill').style.borderColor = 'rgba(239, 68, 68, 0.3)';
      $('statusPill').style.background = 'rgba(239, 68, 68, 0.08)';
      $('statusText').textContent = 'ERROR';
      $('statusText').style.color = 'var(--accent-error)';
    },

    onComplete({ results: r, context: ctx }) {
      context = ctx;
      hideProgress();
      $('doneBanner').style.display = 'flex';
      $('resetBtn').style.display = 'block';
      $('statusText').textContent = 'COMPLETO';
      $('statusText').style.color = 'var(--accent-success)';
      $('statusPill').style.borderColor = 'rgba(16, 185, 129, 0.3)';
      if (studioPanel) studioPanel.enableStudioTab();
    },
  };
}

// ─── Start Agent ─────────────────────────────────────────────────────────
async function startAgent() {
  const niche = $('nicheInput').value.trim();
  const apiKey = $('apiKey').value.trim();

  if (!niche) { toast.warning('Ingresá un nicho'); return; }
  if (!apiKey) { toast.warning('Ingresá tu API key'); return; }

  // Validate key format
  if (currentProvider === PROVIDERS.ANTHROPIC && !apiKey.startsWith('sk-')) {
    toast.error('La API key de Anthropic debe empezar con sk-');
    return;
  }
  if (currentProvider === PROVIDERS.GEMINI && !apiKey.startsWith('AIza')) {
    toast.error('La API key de Gemini debe empezar con AIza');
    return;
  }

  // Reset state
  isRunning = true;
  results = {};
  context = { niche };
  sessionId = generateSessionId();

  // Reset UI
  $('errorBox').style.display = 'none';
  $('doneBanner').style.display = 'none';
  $('resetBtn').style.display = 'none';
  $('btnRun').disabled = true;
  $('nicheInput').disabled = true;
  $('statusText').textContent = 'PROCESANDO ESPAÑOL (LATAM)';
  $('statusText').style.color = 'var(--accent-primary)';
  $('statusPill').style.borderColor = 'rgba(245, 158, 11, 0.3)';
  $('statusPill').style.background = 'rgba(245, 158, 11, 0.08)';

  // Show progress
  showProgress();
  renderStepCards(STEPS);
  renderPipeline(STEPS);
  renderSidebarSteps();
  clearLog();

  try {
    const callbacks = getCallbacks();
    const isDual = $('isDualMode') ? $('isDualMode').checked : true;

    if (isDual) {
      // Interceptamos el onComplete para que no muestre el doneBanner todavía
      const originalOnComplete = callbacks.onComplete;
      callbacks.onComplete = () => { /* no-op during first run */ };

      // 1. Ejecución Español (LatAm)
      await runWorkflow(
        { niche, apiKey, provider: currentProvider, sessionId, language: 'es-latam' },
        callbacks
      );
      
      // Obtenemos resultados ES de la sesión guardada
      const sessionEs = loadSession(sessionId);

      // 2. Ejecución Adaptación Inglés (US)
      $('statusText').textContent = 'PROCESANDO INGLÉS (US)';
      
      // Reset pipeline visual but keep stats
      results = {};
      renderStepCards(STEPS);
      renderPipeline(STEPS);
      renderSidebarSteps();
      
      // Restore the real onComplete for the final run
      callbacks.onComplete = (data) => {
        originalOnComplete(data);
      };

      await runAdaptationWorkflow(
        { sessionEsData: sessionEs, apiKey, provider: currentProvider, sessionId, targetLanguage: 'en-us' },
        callbacks
      );
    } else {
      // Ejecución única: Español solamente
      await runWorkflow(
        { niche, apiKey, provider: currentProvider, sessionId, language: 'es-latam' },
        callbacks
      );
    }

  } catch (e) {
    // Error already handled in callbacks
  }

  isRunning = false;
  $('btnRun').disabled = false;
  $('nicheInput').disabled = false;
}

// ─── Reset ───────────────────────────────────────────────────────────────
function resetAll() {
  results = {};
  context = {};
  sessionId = null;
  isRunning = false;

  $('nicheInput').value = '';
  $('errorBox').style.display = 'none';
  $('doneBanner').style.display = 'none';
  $('resetBtn').style.display = 'none';
  $('logPanel').style.display = 'none';
  $('sidebarStats').style.display = 'none';
  hideProgress();
  clearLog();

  $('statusText').textContent = 'LISTO';
  $('statusText').style.color = 'var(--accent-success)';
  $('statusPill').style.borderColor = 'rgba(16, 185, 129, 0.2)';
  $('statusPill').style.background = 'rgba(16, 185, 129, 0.08)';

  renderStepCards(STEPS);
  renderPipeline(STEPS);
  renderSidebarSteps();
}

// ─── Downloads ───────────────────────────────────────────────────────────
function handleDownloadMd() {
  downloadAllMd(results, context);
}

function handleDownloadJson() {
  downloadAllJson(results, context, {
    provider: currentProvider,
    inputTokens: parseInt($('statTokensIn').textContent.replace(/,/g, '') || '0'),
    outputTokens: parseInt($('statTokensOut').textContent.replace(/,/g, '') || '0'),
    cost: parseFloat($('statCost').textContent.replace('$', '') || '0'),
  });
}

// ─── Resume (Run English Only) ───────────────────────────────────────────
async function runEnglishOnly() {
  const latestId = getLatestSessionId();
  if (!latestId) {
    toast.error("No se encontró una sesión en progreso para continuar.");
    return;
  }
  const sessionEs = loadSession(latestId);
  if (!sessionEs || !sessionEs.results) {
    toast.error("La sesión anterior está incompleta o corrupta.");
    return;
  }

  // Restore State
  sessionId = latestId;
  const niche = sessionEs.niche;
  const apiKey = $('apiKey').value.trim();
  if (!apiKey) { toast.warning('Por favor, reingresá tu API key para continuar'); return; }

  isRunning = true;
  results = {}; // empty pipeline visual
  context = { niche };
  
  $('statusText').textContent = 'PROCESANDO INGLÉS (US) [REANUDADO]';
  $('btnRun').disabled = true;
  $('nicheInput').disabled = true;
  showProgress();
  renderStepCards(STEPS);
  renderPipeline(STEPS);
  renderSidebarSteps();

  try {
    const callbacks = getCallbacks();
    await runAdaptationWorkflow(
      { sessionEsData: sessionEs, apiKey, provider: currentProvider, sessionId, targetLanguage: 'en-us' },
      callbacks
    );
  } catch (e) {
    // handled
  }

  isRunning = false;
  $('btnRun').disabled = false;
  $('nicheInput').disabled = false;
}

// ─── Sessions View ─────────────────────────────────────────────────────────
function renderSessionsTable() {
  const tbody = $('sessionsTableBody');
  if (!tbody) return;
  const sessions = listSessions();
  if (sessions.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="padding: 20px; text-align: center; color: var(--text-muted);">No hay sesiones guardadas.</td></tr>';
    return;
  }
  
  tbody.innerHTML = sessions.map(s => {
    const d = new Date(s.lastUpdate);
    const dateStr = d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const isComplete = s.completedSteps >= 10;
    const statusLabel = isComplete ? '<span style="color:var(--accent-success);">Completado</span>' : '<span style="color:var(--accent-primary);">En progreso</span>';
    const name = s.productName || s.niche || 'Sesión sin nombre';
    return `
      <tr style="border-bottom: 1px solid var(--border-subtle);">
        <td style="padding: 12px 16px;">${dateStr}</td>
        <td style="padding: 12px 16px; font-weight: 500;">${name.length > 50 ? name.substring(0, 50) + '...' : name}</td>
        <td style="padding: 12px 16px;">${s.completedSteps}/10</td>
        <td style="padding: 12px 16px;">${statusLabel}</td>
        <td style="padding: 12px 16px; text-align: right;">
          <button class="btn-ghost btn-sm" onclick="window.__loadSessionData('${s.id}')" title="Cargar sesión">📂 Cargar</button>
          <button class="btn-ghost btn-sm" onclick="window.__deleteSessionData('${s.id}')" style="color:var(--accent-error);" title="Eliminar sesión">🗑️</button>
        </td>
      </tr>
    `;
  }).join('');
}

function loadSessionData(id) {
  const data = loadSession(id);
  if (!data) return;
  
  // Restore State
  sessionId = id;
  $('nicheInput').value = data.niche || '';
  if (data.provider) {
    document.querySelectorAll('.provider-option').forEach(b => {
      b.classList.toggle('active', b.dataset.provider === data.provider);
      if (b.dataset.provider === data.provider) currentProvider = data.provider;
    });
  }
  
  // Go to main view
  document.querySelector('.sidebar-item[data-view="main"]').click();
  toast.success('Sesión cargada. Recuerda reingresar tu API Key para continuar si no ha terminado.');
}

function deleteSessionData(id) {
  if (confirm('¿Estás seguro de que deseas eliminar esta sesión?')) {
    deleteSession(id);
    renderSessionsTable();
  }
}

// ─── Expose to HTML onclick handlers ─────────────────────────────────────
window.__startAgent = startAgent;
window.__resetAll = resetAll;
window.__runEnglishOnly = runEnglishOnly;
window.__loadSessionData = loadSessionData;
window.__deleteSessionData = deleteSessionData;
window.__downloadStep = (stepId) => {
  if (results[stepId]) {
    const step = STEPS.find(s => s.id === stepId);
    downloadStep(stepId, results[stepId], step.title);
    toast.success(`Descargando paso ${stepId}...`);
  }
};

// ─── Settings Logic ──────────────────────────────────────────────────────
function initSettingsUI() {
  // Populate Models
  const selectAnthropic = $('settingModelAnthropic');
  const selectGemini = $('settingModelGemini');
  if (selectAnthropic) {
    selectAnthropic.innerHTML = AVAILABLE_MODELS.anthropic.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
  }
  if (selectGemini) {
    selectGemini.innerHTML = AVAILABLE_MODELS.gemini.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
  }

  // Tone Buttons
  const toneButtons = document.querySelectorAll('#settingToneSelect .provider-option');
  toneButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      toneButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Save Button
  $('btnSaveSettings')?.addEventListener('click', () => {
    const activeToneBtn = document.querySelector('#settingToneSelect .provider-option.active');
    
    saveSettings({
      model: {
        anthropic: $('settingModelAnthropic')?.value,
        gemini: $('settingModelGemini')?.value
      },
      tone: activeToneBtn?.dataset.tone || 'profesional',
      maxBudget: parseFloat($('settingMaxBudget')?.value) || 1.00,
      customSystemPrompt: {
        'es-latam': $('settingPromptLatam')?.value || null,
        'en-us': $('settingPromptUs')?.value || null
      }
    });
    
    toast.success('Ajustes guardados correctamente');
  });
  
  loadSettingsToUI();
}

function loadSettingsToUI() {
  const s = loadSettings();

  // Theme
  document.documentElement.dataset.theme = s.theme || 'dark';

  // Models
  if ($('settingModelAnthropic')) $('settingModelAnthropic').value = s.model.anthropic;
  if ($('settingModelGemini')) $('settingModelGemini').value = s.model.gemini;
  if ($('settingModelOpenrouter')) $('settingModelOpenrouter').value = s.model.openrouter;
  if ($('settingModelOllama')) $('settingModelOllama').value = s.model.ollama;

  // OpenRouter & Ollama credentials
  if ($('settingOpenrouterKey')) $('settingOpenrouterKey').value = s.openrouterApiKey || '';
  if ($('settingOllamaEndpoint')) $('settingOllamaEndpoint').value = s.ollamaEndpoint || 'http://localhost:11434';

  // Cache toggle & Budget
  if ($('settingCacheEnabled')) $('settingCacheEnabled').checked = s.cacheEnabled === true;
  if ($('settingMaxBudget')) $('settingMaxBudget').value = s.maxBudget || 1.00;

  // Tone
  const toneButtons = document.querySelectorAll('#settingToneSelect .provider-option');
  toneButtons.forEach(b => {
    b.classList.toggle('active', b.dataset.tone === s.tone);
  });

  // Prompts
  if ($('settingPromptLatam')) $('settingPromptLatam').value = s.customSystemPrompt['es-latam'] || '';
  if ($('settingPromptUs')) $('settingPromptUs').value = s.customSystemPrompt['en-us'] || '';
}

// ─── Theme Toggle ────────────────────────────────────────────────────────
function handleThemeToggle() {
  const newTheme = toggleTheme();
  document.documentElement.dataset.theme = newTheme;
  toast.info(newTheme === 'dark' ? '🌙 Modo oscuro activado' : '☀️ Modo claro activado');
}

// ─── Init ────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initSettingsUI();
  updateClock();
  initProviderSelect();
  renderStepCards(STEPS);
  renderPipeline(STEPS);
  renderSidebarSteps();
  renderSessionsTable();
  
  studioPanel = new StudioPanel(window);

  // Event listeners
  $('btnThemeToggle')?.addEventListener('click', handleThemeToggle);
  $('btnDlMd')?.addEventListener('click', handleDownloadMd);
  $('btnDlJson')?.addEventListener('click', handleDownloadJson);
  $('btnClearLog')?.addEventListener('click', clearLog);
  $('btnRefreshSessions')?.addEventListener('click', renderSessionsTable);
  $('nicheInput')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !isRunning) startAgent();
  });

  // Sidebar navigation
  document.querySelectorAll('.sidebar-item[data-view]').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.sidebar-item[data-view]').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      
      const viewId = item.dataset.view;
      if (viewId === 'sessions') renderSessionsTable();

      const views = {
        'main': 'viewMain',
        'sessions': 'viewSessions',
        'settings': 'viewSettings'
      };
      
      Object.values(views).forEach(v => {
        const el = $(v);
        if (el) el.style.display = 'none';
      });
      
      const targetEl = $(views[viewId]);
      if (targetEl) {
        targetEl.style.display = 'block';
        // Add a small fade-in animation
        targetEl.style.animation = 'fadeUp 0.3s ease forwards';
      }
    });
  });
});
