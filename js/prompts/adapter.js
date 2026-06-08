export function buildPrompt({ niche, productName, targetLanguage }, contentToAdapt, stepTitle) {
  return `Aquí tienes el contenido generado para el paso "${stepTitle}".
El contenido fue creado originalmente para un mercado hispanohablante.
Tu tarea es ADAPTAR este contenido al mercado global / Estados Unidos en el idioma: ${targetLanguage}.

REGLAS DE ADAPTACIÓN:
1. TRADUCCIÓN NO ROBÓTICA: Adapta culturalmente el texto. Usa modismos, expresiones y frases idiomáticas naturales del inglés americano.
2. MANTENER LA ESTRUCTURA EXACTA: Si hay listas numeradas, viñetas, bloques o tablas, debes mantener la misma cantidad de ítems y la misma estructura Markdown.
3. CONSERVAR EL TONO ORIGINAL: Si el texto original es empático, cálido y emocional (ej. nicho "padres", "bullying"), DEBES mantener ese mismo tono. NO uses lenguaje corporativo ni de negocios (como "ROI", "scalable", "resources") a menos que el texto original lo use explícitamente.
4. SOLO EL CONTENIDO: No incluyas preámbulos, introducciones ni explicaciones de lo que hiciste. Devuelve única y exclusivamente el texto adaptado en formato Markdown.

Nicho: "${niche}"
Producto: "${productName}"

CONTENIDO A ADAPTAR:
---
${contentToAdapt}
---

ESCRIBE EL CONTENIDO ADAPTADO ABAJO (MANTENIENDO EL MISMO FORMATO Y ESTRUCTURA, TRADUCIENDO TÍTULOS Y ETIQUETAS AL INGLÉS):`;
}
