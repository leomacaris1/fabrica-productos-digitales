import { callLLM } from '../api/providers.js';
import { ADAPTER_SYSTEM_PROMPTS } from '../config.js';

export async function adapterTranslate({ content, context, apiKey, provider, language, onRetry }) {
  const systemPrompt = ADAPTER_SYSTEM_PROMPTS[language] || ADAPTER_SYSTEM_PROMPTS['en-us'];

  const start = Date.now();
  const response = await callLLM({
    prompt: content,
    systemPrompt,
    apiKey,
    provider,
    onRetry
  });

  return {
    text: response.text,
    inputTokens: response.inputTokens || 0,
    outputTokens: response.outputTokens || 0,
    timeMs: Date.now() - start
  };
}

