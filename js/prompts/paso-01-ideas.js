export function buildPrompt({ niche }) {
  return `Actúa como investigador de mercado experto. Dame EXACTAMENTE 10 ideas de productos digitales en el nicho "${niche}".
OBLIGATORIO: escribe las 10, numeradas del 1 al 10. No te detengas antes del número 10.

Para CADA idea usa esta tabla completa:
| Elemento | Detalle |
|----------|----------|
| Audiencia | ... |
| Transformación | ... |
| Formato | ... |
| Por qué pagan | ... |

Separa cada idea con ---

Al final, en una línea propia: **IDEA GANADORA: [nombre exacto de la idea con más potencial]**`;
}
