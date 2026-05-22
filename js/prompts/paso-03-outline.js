export function buildPrompt({ niche, idea }) {
  return `Producto: "${idea}" — Nicho: "${niche}"

Crea el outline COMPLETO:

**NOMBRE OFICIAL:** [nombre atractivo del producto]
**Formato:** [tipo de producto]
**Duración total:** [tiempo]
**Ritmo de entrega:** [frecuencia]

Escribe EXACTAMENTE 5 MÓDULOS. Cada módulo tiene EXACTAMENTE 3 LECCIONES.
Para cada lección: Tema | Pasos accionables numerados (mín 4) | Ejemplo concreto del nicho "${niche}" | Ejercicio o checklist (mín 4 ítems).

Estructura:
## MÓDULO 1: [título]
### Lección 1.1: [título]
...
### Lección 1.2: [título]
...
### Lección 1.3: [título]
...

## MÓDULO 2: [título]
[continúa igual]

[hasta MÓDULO 5 completo]

NO pares antes del MÓDULO 5, LECCIÓN 3.`;
}
