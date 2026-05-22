export function buildPrompt({ niche, productName }) {
  return `Producto: "${productName}" — Nicho: "${niche}"

Guía completa para escalar con Claude. Escribe ESTAS 5 SECCIONES:

## 1. PROMPT DE CONTEXTO DE AUDIENCIA
Un prompt largo y detallado (8-10 líneas) listo para copiar-pegar en Claude, con todos los datos del cliente ideal del nicho "${niche}" ya completados.

## 2. PROMPT DE TONO DE MARCA
Tabla: Aspecto | Cómo ES | Cómo NO ES (mínimo 6 filas con ejemplos específicos del nicho)
Luego: prompt completo listo para pegar en Claude describiendo el tono.

## 3. TEMPLATE DE FEEDBACK E ITERACIÓN
Preguntas para días 3, 14, 45 y 90 (completas).
Prompt iterativo listo para darle a Claude cuando lleguen respuestas de compradores.

## 4. PROCESO DE ANÁLISIS DE COMPETENCIA
Proceso de 5 pasos detallados + prompt listo para diferenciarse de la competencia.

## 5. CINCO PROMPTS AVANZADOS
Para cada prompt:
**Nombre:** [nombre del prompt]
**Objetivo:** [qué logra]
**Prompt completo:** [el prompt entero con variables del nicho "${niche}" ya rellenas]

ESCRIBE LAS 5 SECCIONES Y LOS 5 PROMPTS COMPLETOS.`;
}
