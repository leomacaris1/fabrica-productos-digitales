export function buildPrompt({ niche, productName, s2, s5 }) {
  return `Sales page COMPLETA para "${productName}" — Nicho: "${niche}"
Contexto cliente: ${s2 ? s2.substring(0, 300) : ''}
Bonos: ${s5 ? s5.substring(0, 250) : ''}

Escribe los 10 BLOQUES en orden. COMPLETA TODOS.

## BLOQUE 1 — HERO
Headline principal (hook fuerte) + Subheadline con exactamente 4 puntos de dolor en bullets.

## BLOQUE 2 — AGITACIÓN
El problema real, visceral. 3-4 párrafos que hagan al lector decir "esto soy yo".

## BLOQUE 3 — PROMESA DE TRANSFORMACIÓN
Headline de transformación + tabla: Resultado | Beneficio concreto (mínimo 5 filas).

## BLOQUE 4 — CÓMO FUNCIONA
Las 3 fases del sistema. Cada fase con nombre, emoji, descripción y 3 bullets de lo que incluye.

## BLOQUE 5 — QUÉ INCLUYE
Lista completa: producto principal + cada bono con su beneficio específico.

## BLOQUE 6 — TESTIMONIOS
[TESTIMONIO 1: contexto — qué tipo de persona, qué resultado, tono sugerido]
[TESTIMONIO 2: contexto — qué tipo de persona, qué resultado, tono sugerido]

## BLOQUE 7 — SOBRE EL CREADOR
Estructura sugerida de credibilidad (3-4 párrafos con variables a reemplazar).

## BLOQUE 8 — GARANTÍA
Texto completo de garantía con reducción de riesgo (2-3 párrafos).

## BLOQUE 9 — PRECIO + CTA
Precio con anclaje, lista de todo lo que incluye, texto del botón, urgencia.

## BLOQUE 10 — FAQs
EXACTAMENTE 5 preguntas frecuentes con respuestas completas de 3-4 líneas cada una.

ESCRIBE LOS 10 BLOQUES COMPLETOS.`;
}
