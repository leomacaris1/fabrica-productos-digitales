/**
 * Show the progress bar
 */
export function showProgress() {
  const wrap = document.getElementById('progressWrap');
  if (wrap) wrap.style.display = 'block';
  updateProgress(0, 10);
}

/**
 * Hide the progress bar
 */
export function hideProgress() {
  const wrap = document.getElementById('progressWrap');
  if (wrap) wrap.style.display = 'none';
}

/**
 * Update progress bar
 * @param {number} current
 * @param {number} total
 */
export function updateProgress(current, total) {
  const pct = Math.round((current / total) * 100);
  const label = document.getElementById('progressLabel');
  const pctEl = document.getElementById('progressPct');
  const fill = document.getElementById('progressFill');

  if (label) label.textContent = current === 0 ? 'Iniciando...' : `Paso ${current}/${total}`;
  if (pctEl) pctEl.textContent = pct + '%';
  if (fill) fill.style.width = pct + '%';
}
