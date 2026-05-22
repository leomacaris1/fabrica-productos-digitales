/**
 * Render the mini pipeline in the topbar
 * @param {Array} steps
 */
export function renderPipeline(steps) {
  const container = document.getElementById('pipelineMini');
  if (!container) return;

  container.innerHTML = steps.map((s, i) => `
    <div class="pipeline-node idle" id="pipe-${s.id}">${String(s.id).padStart(2, '0')}</div>
    ${i < steps.length - 1 ? '<span class="pipeline-arrow">›</span>' : ''}
  `).join('');
}

/**
 * Update a single pipeline node state
 * @param {number} stepId
 * @param {string} state - 'idle' | 'active' | 'qa' | 'done'
 */
export function updatePipelineNode(stepId, state) {
  const node = document.getElementById(`pipe-${stepId}`);
  if (!node) return;
  node.className = `pipeline-node ${state}`;
}
