import { STEP_TITLES } from '../config.js';

/**
 * Build complete markdown from results
 */
export function buildMarkdown(results, context) {
  const date = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  let md = `# ${context.productName || context.niche.toUpperCase()}\n`;
  md += `**Nicho:** ${context.niche}\n`;
  md += `**Generado:** ${date} · Fábrica de Productos Digitales\n\n---\n\n`;

  for (let i = 1; i <= 10; i++) {
    if (results[i]) {
      md += `# PASO ${i}: ${STEP_TITLES[i]}\n\n${results[i]}\n\n---\n\n`;
    }
  }
  return md;
}

/**
 * Build JSON export
 */
export function buildJSON(results, context, stats) {
  return JSON.stringify({
    meta: {
      generator: 'Fábrica de Productos Digitales v1.0',
      generatedAt: new Date().toISOString(),
      niche: context.niche,
      productName: context.productName || context.idea,
      provider: stats.provider,
      totalCost: stats.cost,
      totalTokens: { input: stats.inputTokens, output: stats.outputTokens },
    },
    steps: Object.fromEntries(
      Object.entries(results).map(([k, v]) => [k, { title: STEP_TITLES[k], content: v }])
    ),
    context,
  }, null, 2);
}

/**
 * Download a string as a file
 */
export function downloadFile(content, filename, mimeType = 'text/markdown;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Download all results as markdown
 */
export function downloadAllMd(results, context) {
  const name = (context.productName || context.niche)
    .toLowerCase().replace(/\s+/g, '-').substring(0, 35);
  downloadFile(buildMarkdown(results, context), `${name}-completo.md`);
}

/**
 * Download all results as JSON
 */
export function downloadAllJson(results, context, stats) {
  const name = (context.productName || context.niche)
    .toLowerCase().replace(/\s+/g, '-').substring(0, 35);
  downloadFile(buildJSON(results, context, stats), `${name}-data.json`, 'application/json;charset=utf-8');
}

/**
 * Download a single step
 */
export function downloadStep(stepId, content, stepTitle) {
  const name = stepTitle.toLowerCase().replace(/\s+/g, '-').substring(0, 30);
  downloadFile(content, `paso-${stepId}-${name}.md`);
}
