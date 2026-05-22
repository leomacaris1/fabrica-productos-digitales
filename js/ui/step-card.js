let expandedStep = null;

/**
 * Render all step cards
 * @param {Array} steps
 */
export function renderStepCards(steps) {
  expandedStep = null;
  const container = document.getElementById('stepsList');
  if (!container) return;

  container.innerHTML = steps.map((s, i) => `
    <div class="step-card idle animate-fade-up delay-${i + 1}" id="step-${s.id}">
      <div class="step-header" id="hdr-${s.id}">
        <span class="step-icon" id="ico-${s.id}">◻️</span>
        <span class="step-emoji">${s.emoji}</span>
        <div class="step-info">
          <div style="display:flex;align-items:center;gap:5px">
            <span class="step-num">#${s.id}</span>
            <span class="step-title" id="ttl-${s.id}">${s.title}</span>
            <span class="badge badge-qa" id="bdg-qa-${s.id}" style="display:none">QA ✓</span>
            <span class="badge badge-amber" id="bdg-cont-${s.id}" style="display:none">continuado</span>
          </div>
          <div class="step-desc">${s.desc}</div>
        </div>
        <span class="step-status" id="sts-${s.id}"></span>
        <span class="step-chevron" id="chv-${s.id}" style="display:none">▼</span>
      </div>
      <div class="step-body" id="bdy-${s.id}">
        <div class="step-actions">
          <button class="btn-ghost btn-sm" onclick="window.__downloadStep(${s.id})">⬇ este paso</button>
        </div>
        <div class="step-content" id="cnt-${s.id}"></div>
      </div>
    </div>
  `).join('');
}

/**
 * Update a step card's state
 * @param {number} stepId
 * @param {string} state - 'idle' | 'active' | 'qa' | 'continuation' | 'done' | 'error'
 * @param {string} [statusLabel]
 * @param {string} [content]
 * @param {Object} [validation]
 */
export function updateStepCard(stepId, state, statusLabel, content, validation) {
  const card = document.getElementById(`step-${stepId}`);
  const icon = document.getElementById(`ico-${stepId}`);
  const status = document.getElementById(`sts-${stepId}`);
  const chevron = document.getElementById(`chv-${stepId}`);
  const header = document.getElementById(`hdr-${stepId}`);
  const body = document.getElementById(`bdy-${stepId}`);
  const contentEl = document.getElementById(`cnt-${stepId}`);
  const qaBadge = document.getElementById(`bdg-qa-${stepId}`);

  if (!card) return;

  // Update card class
  card.className = `step-card ${state === 'qa' ? 'qa-active' : state}`;

  // Update icon
  const icons = { idle: '◻️', active: '⏳', qa: '🔍', continuation: '🔄', done: '✅', error: '❌' };
  if (icon) icon.textContent = icons[state] || '◻️';

  // Update status
  if (status) {
    status.textContent = statusLabel || '';
    const statusClasses = { active: 'generating', qa: 'reviewing', continuation: 'continuing' };
    status.className = `step-status ${statusClasses[state] || ''}`;
  }

  // If done, make clickable and show content
  if (state === 'done' && content) {
    if (contentEl) contentEl.textContent = content;
    if (header) {
      header.classList.add('clickable');
      header.onclick = () => toggleStep(stepId);
    }
    if (chevron) chevron.style.display = 'inline';
    if (qaBadge) qaBadge.style.display = 'inline';
  }
}

/**
 * Toggle step expansion
 */
function toggleStep(id) {
  const body = document.getElementById(`bdy-${id}`);
  const chevron = document.getElementById(`chv-${id}`);

  if (expandedStep === id) {
    body.className = 'step-body';
    chevron.textContent = '▼';
    expandedStep = null;
  } else {
    if (expandedStep !== null) {
      const prevBody = document.getElementById(`bdy-${expandedStep}`);
      const prevChev = document.getElementById(`chv-${expandedStep}`);
      if (prevBody) prevBody.className = 'step-body';
      if (prevChev) prevChev.textContent = '▼';
    }
    body.className = 'step-body open';
    chevron.textContent = '▲';
    expandedStep = id;
  }
}
