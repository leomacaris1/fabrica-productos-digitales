import { STEPS } from '../config.js';
import { writerGenerate } from './writer.js';
import { qaReview } from './qa.js';
import { continueIfNeeded } from './continuation.js';
import { validateStep, cleanAgentOutput } from '../utils/validation.js';
import { calculateCost } from '../api/providers.js';
import { saveSession } from '../utils/session.js';

// Import all prompt builders
import { buildPrompt as prompt01 } from '../prompts/paso-01-ideas.js';
import { buildPrompt as prompt02 } from '../prompts/paso-02-validacion.js';
import { buildPrompt as prompt03 } from '../prompts/paso-03-outline.js';
import { buildPrompt as prompt04 } from '../prompts/paso-04-escritura.js';
import { buildPrompt as prompt05 } from '../prompts/paso-05-bonos.js';
import { buildPrompt as prompt06 } from '../prompts/paso-06-branding.js';
import { buildPrompt as prompt07 } from '../prompts/paso-07-salespage.js';
import { buildPrompt as prompt08 } from '../prompts/paso-08-repurposing.js';
import { buildPrompt as prompt09 } from '../prompts/paso-09-contenido.js';
import { buildPrompt as prompt10 } from '../prompts/paso-10-contexto.js';

const PROMPT_BUILDERS = {
  1: prompt01, 2: prompt02, 3: prompt03, 4: prompt04, 5: prompt05,
  6: prompt06, 7: prompt07, 8: prompt08, 9: prompt09, 10: prompt10,
};

/**
 * @typedef {Object} WorkflowCallbacks
 * @property {function(number, string)} onStepStart - (stepId, label)
 * @property {function(number)} onStepQA - (stepId)
 * @property {function(number, number)} onStepContinuation - (stepId, passNumber)
 * @property {function(number, string, Object)} onStepComplete - (stepId, content, validation)
 * @property {function(string, string)} onLog - (message, type: 'writer'|'qa'|'continuation'|'ok'|'error')
 * @property {function(number, number)} onProgress - (currentStep, totalSteps)
 * @property {function(Object)} onStats - ({inputTokens, outputTokens, cost, calls, continuations, qaFixes})
 * @property {function(Error)} onError - (error)
 * @property {function(Object)} onComplete - (results)
 */

/**
 * Run the full 10-step workflow
 * @param {Object} params
 * @param {string} params.niche
 * @param {string} params.apiKey
 * @param {string} params.provider
 * @param {string} params.sessionId
 * @param {string} [params.language='es-latam']
 * @param {WorkflowCallbacks} callbacks
 */
export async function runWorkflow({ niche, apiKey, provider, sessionId, language = 'es-latam' }, callbacks) {
  const results = {};
  const ctx = { niche };
  let totalIn = 0, totalOut = 0, totalCalls = 0, totalContinuations = 0, totalQAFixes = 0;

  const updateStats = () => {
    const cost = calculateCost(provider, totalIn, totalOut);
    callbacks.onStats?.({
      inputTokens: totalIn,
      outputTokens: totalOut,
      cost,
      calls: totalCalls,
      continuations: totalContinuations,
      qaFixes: totalQAFixes,
      provider,
    });
  };

  const trackTokens = (result) => {
    totalIn += result.inputTokens || result.totalInputTokens || 0;
    totalOut += result.outputTokens || result.totalOutputTokens || 0;
    totalCalls++;
    updateStats();
  };

  /**
   * Generate content for a step with continuation + QA
   */
  async function generateStep(stepId, prompt, contextStr, subLabel) {
    const onRetry = (attempt, delay, error) => {
      const sec = (delay / 1000).toFixed(0);
      callbacks.onRetry?.(stepId, attempt, delay, error);
      callbacks.onLog?.(`Paso ${stepId} — API saturada o error de red. Intento ${attempt} en ${sec}s...`, 'error');
    };

    // 1. Writer generates
    callbacks.onStepStart?.(stepId, subLabel || 'Writer generando...');
    callbacks.onLog?.(`Paso ${stepId}${subLabel ? ' [' + subLabel + ']' : ''} — Writer Agent (${language})`, 'writer');

    const writerResult = await writerGenerate({ prompt, apiKey, provider, language, onRetry });
    trackTokens(writerResult);
    let content = writerResult.text;

    // 2. Continuation if truncated
    const contResult = await continueIfNeeded({
      content,
      apiKey,
      provider,
      language,
      onContinuation: (pass) => {
        totalContinuations++;
        callbacks.onStepContinuation?.(stepId, pass);
        callbacks.onLog?.(`Paso ${stepId} — Truncado → Continuation Agent (${pass})`, 'continuation');
      },
      onRetry
    });
    if (contResult.passes > 0) {
      content = contResult.text;
      totalIn += contResult.totalInputTokens;
      totalOut += contResult.totalOutputTokens;
      totalCalls += contResult.passes;
      updateStats();
    }

    // Sanitize writer's content
    content = cleanAgentOutput(content, stepId);

    // 3. QA review
    callbacks.onStepQA?.(stepId);
    callbacks.onLog?.(`Paso ${stepId} — QA Agent revisando (${language})`, 'qa');
    const qaResult = await qaReview({ content, contextStr, apiKey, provider, language, onRetry });
    trackTokens(qaResult);
    if (qaResult.wasFixed) {
      totalQAFixes++;
      content = qaResult.text;
      callbacks.onLog?.(`Paso ${stepId} — QA corrigió contenido`, 'qa');
    }

    // Sanitize final QA-corrected content
    content = cleanAgentOutput(content, stepId);

    // 4. Validate
    const validation = validateStep(stepId, content);
    callbacks.onLog?.(
      `Paso ${stepId} — ${validation.valid ? '✓' : '⚠'} ${validation.message}${contResult.passes > 0 ? ` (${contResult.passes} continuación/es)` : ''}`,
      validation.valid ? 'ok' : 'error'
    );

    return { content, validation };
  }

  try {
    // PASO 1 — Ideas
    callbacks.onProgress?.(1, 10);
    const { content: s1 } = await generateStep(1, prompt01(ctx), `Nicho: ${niche}`);
    results[1] = s1;
    callbacks.onStepComplete?.(1, s1, validateStep(1, s1));

    // Extract winning idea
    const ideaMatch = s1.match(/IDEA GANADORA[:\s*]+([^\n]+)/i);
    ctx.idea = ideaMatch ? ideaMatch[1].replace(/\*+/g, '').trim() : 'la idea con mayor potencial';
    callbacks.onLog?.(`Idea ganadora: "${ctx.idea}"`, 'ok');

    // PASO 2 — Validación
    callbacks.onProgress?.(2, 10);
    const { content: s2 } = await generateStep(2, prompt02(ctx), `Nicho: ${niche}. Idea: ${ctx.idea}`);
    results[2] = s2;
    ctx.s2 = s2;
    callbacks.onStepComplete?.(2, s2, validateStep(2, s2));

    // PASO 3 — Outline
    callbacks.onProgress?.(3, 10);
    const { content: s3 } = await generateStep(3, prompt03(ctx), `Nicho: ${niche}. Idea: ${ctx.idea}`);
    results[3] = s3;
    ctx.s3 = s3;
    callbacks.onStepComplete?.(3, s3, validateStep(3, s3));

    // Extract product name
    const nameMatch = s3.match(/\*\*NOMBRE OFICIAL[:\s"*]+([^\n"*\]]+)/i) || s3.match(/nombre oficial[:\s"*]+([^\n"*]+)/i);
    ctx.productName = nameMatch ? nameMatch[1].trim() : ctx.idea;
    callbacks.onLog?.(`Nombre: "${ctx.productName}"`, 'ok');

    // PASO 4 — Content (module by module)
    callbacks.onProgress?.(4, 10);
    let allModules = '';
    for (let mod = 1; mod <= 5; mod++) {
      const { content: modText } = await generateStep(
        4, prompt04(ctx, mod),
        `Módulo ${mod}/5. Producto: ${ctx.productName}`,
        `módulo ${mod}/5`
      );
      allModules += `\n\n---\n\n${modText}`;
    }
    results[4] = allModules.trim();
    callbacks.onStepComplete?.(4, results[4], validateStep(4, results[4]));

    // PASO 5 — Bonos
    callbacks.onProgress?.(5, 10);
    const { content: s5 } = await generateStep(5, prompt05(ctx), `Nicho: ${niche}. Producto: ${ctx.productName}`);
    results[5] = s5;
    ctx.s5 = s5;
    callbacks.onStepComplete?.(5, s5, validateStep(5, s5));

    // PASO 6 — Branding
    callbacks.onProgress?.(6, 10);
    const { content: s6 } = await generateStep(6, prompt06(ctx), `Nicho: ${niche}. Producto: ${ctx.productName}`);
    results[6] = s6;
    callbacks.onStepComplete?.(6, s6, validateStep(6, s6));

    // PASO 7 — Sales Page
    callbacks.onProgress?.(7, 10);
    const { content: s7 } = await generateStep(7, prompt07(ctx), `Nicho: ${niche}. Producto: ${ctx.productName}`);
    results[7] = s7;
    callbacks.onStepComplete?.(7, s7, validateStep(7, s7));

    // PASO 8 — Repurposing
    callbacks.onProgress?.(8, 10);
    const { content: s8 } = await generateStep(8, prompt08(ctx), `Nicho: ${niche}. Producto: ${ctx.productName}`);
    results[8] = s8;
    callbacks.onStepComplete?.(8, s8, validateStep(8, s8));

    // PASO 9 — Contenido
    callbacks.onProgress?.(9, 10);
    const { content: s9 } = await generateStep(9, prompt09(ctx), `Nicho: ${niche}. Producto: ${ctx.productName}`);
    results[9] = s9;
    callbacks.onStepComplete?.(9, s9, validateStep(9, s9));

    // PASO 10 — Contexto
    callbacks.onProgress?.(10, 10);
    const { content: s10 } = await generateStep(10, prompt10(ctx), `Nicho: ${niche}. Producto: ${ctx.productName}`);
    results[10] = s10;
    callbacks.onStepComplete?.(10, s10, validateStep(10, s10));

    // Save session
    saveSession(sessionId, {
      niche,
      productName: ctx.productName,
      idea: ctx.idea,
      status: 'complete',
      results,
      provider,
      stats: { inputTokens: totalIn, outputTokens: totalOut, calls: totalCalls, cost: calculateCost(provider, totalIn, totalOut) },
    });

    callbacks.onLog?.(`✅ Completo. ${totalCalls} llamadas · ${totalContinuations} continuaciones · ${totalQAFixes} correcciones QA`, 'ok');
    callbacks.onComplete?.({ results, context: ctx });

  } catch (error) {
    // Save partial session on error
    saveSession(sessionId, {
      niche,
      productName: ctx.productName,
      idea: ctx.idea,
      status: 'error',
      results,
      error: error.message,
      provider,
    });

    callbacks.onLog?.(`❌ ${error.message}`, 'error');
    callbacks.onError?.(error);
    throw error;
  }
}
