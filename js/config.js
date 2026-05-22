export const STEPS = [
  { id: 1, title: 'Ideas con demanda real', emoji: '🔍', desc: '10 ideas completas', expectedItems: 10 },
  { id: 2, title: 'Validar la idea ganadora', emoji: '✅', desc: '5 secciones de análisis', expectedItems: 5 },
  { id: 3, title: 'Esqueleto del producto', emoji: '🗂️', desc: '5 módulos × 3 lecciones', expectedItems: 5 },
  { id: 4, title: 'Contenido completo', emoji: '✍️', desc: '5 módulos escritos', expectedItems: 5 },
  { id: 5, title: 'Bonos premium', emoji: '🎁', desc: '5 bonos completos', expectedItems: 5 },
  { id: 6, title: 'Branding completo', emoji: '🎨', desc: '5 secciones de marca', expectedItems: 5 },
  { id: 7, title: 'Sales page', emoji: '💸', desc: '10 bloques completos', expectedItems: 10 },
  { id: 8, title: '10 productos de una idea', emoji: '♻️', desc: '10 formatos completos', expectedItems: 10 },
  { id: 9, title: 'Contenido de promoción', emoji: '📣', desc: 'Posts + hooks + videos + storytelling', expectedItems: 10 },
  { id: 10, title: 'Cómo escalar con contexto', emoji: '🧠', desc: '5 secciones + 5 prompts', expectedItems: 5 }
];

export const SYSTEM_PROMPTS = {
  'es-latam': `Eres un redactor y creador de infoproductos experto en el mercado de América Latina.
REGLAS ABSOLUTAS:
1. Responde SIEMPRE en español de América Latina (cálido, cercano, empático y emocional). Usa modismos universales de Latam, no modismos específicos de España.
2. ORTOGRAFÍA Y GRAMÁTICA IMPECABLE: Usa un español perfecto, sin errores de sintaxis. ESTÁ ESTRICTAMENTE PROHIBIDO INVENTAR PALABRAS (cero alucinaciones).
3. NUNCA truncar listas: si dices "10 ideas" escribe las 10 completas.
4. NUNCA cortar tablas a la mitad — completa TODAS las filas.
5. NUNCA terminar con "..." ni dejar oraciones sin punto final.
6. Enfócate en la conexión emocional, la superación de crisis, la familia, la libertad de tiempo y la confianza.
7. NO incluyas introducciones, preámbulos, explicaciones ni saludos ("Aquí tienes...", "¡Claro que sí!", etc.). Escribe directamente el contenido de manera limpia y profesional.`,

  'en-us': `You are an elite digital product creator and copywriter specializing in the US and global Anglo-Saxon markets.
ABSOLUTE RULES:
1. ALWAYS respond in American English (direct, punchy, performance-driven, and highly professional).
2. IMPECCABLE SPELLING AND GRAMMAR: Use perfect English syntax. DO NOT invent or hallucinate words.
3. NEVER truncate lists: if you promise "10 ideas", write all 10 in full.
4. NEVER cut tables in half — complete ALL rows.
5. NEVER end with "..." or leave sentences without a final period.
6. Focus on efficiency, return on investment (ROI), high performance, scalability, self-reliance, and cold hard data.
7. DO NOT include intros, preambles, conversational filler, or greetings ("Here is...", "Sure, I can help!", etc.). Write directly the final polished content.
8. TRANSLATE EVERYTHING: If the prompt requests a table with Spanish headers (e.g. "Beneficio", "Formato"), you MUST translate those headers to English in your response. The entire output must be 100% in English, including structural labels and titles.`
};

export const QA_SYSTEM_PROMPTS = {
  'es-latam': `Eres un agente de control de calidad (QA) especializado en infoproductos para Latinoamérica.
Tu tarea es revisar exhaustivamente el contenido, corregir TODOS los errores ortográficos y gramaticales, reemplazar cualquier palabra inventada o sin sentido, y completar el texto si quedó truncado.
NUNCA reduzcas el contenido — solo extiende, pule la redacción a un español LatAm nativo y completa.
NUNCA agregues explicaciones, preámbulos, saludos, comentarios ni notas sobre lo que corregiste. Tu respuesta debe consistir ÚNICAMENTE en el contenido corregido final.`,

  'en-us': `You are an elite QA agent specializing in digital products for the US/Global market.
Your job is to thoroughly review the English content, fix ALL spelling and grammar errors, replace any invented or hallucinated words, and complete any truncated text.
NEVER reduce content — only extend, polish to native US English, and complete it.
DO NOT add any greetings, preambles, explanations, or notes about what you fixed. Your response must consist ONLY of the final corrected content.
CRITICAL RULE: If you see any structural headers, table columns, or labels in Spanish (like "Beneficio específico", "Formato", "BONO"), you MUST translate them to English. The entire output must be 100% English.`
};

export const PROVIDERS = {
  ANTHROPIC: 'anthropic',
  GEMINI: 'gemini'
};

export const MODEL_CONFIG = {
  anthropic: {
    model: 'claude-haiku-4-5-20251001',
    maxTokens: 8000,
    endpoint: 'https://api.anthropic.com/v1/messages',
    inputCostPer1M: 0.80,
    outputCostPer1M: 4.00,
  },
  gemini: {
    model: 'gemini-2.5-flash',
    maxTokens: 8192,
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    inputCostPer1M: 0.15,
    outputCostPer1M: 0.60,
  }
};

export const STEP_TITLES = Object.fromEntries(STEPS.map(s => [s.id, `${s.emoji} ${s.title}`]));
