export function buildPrompt({ niche, productName }) {
  return `Producto: "${productName}" — Nicho: "${niche}"

Escribe EXACTAMENTE 5 BONOS PREMIUM. Escribe los 5 completos. No pares antes del BONO 5.

Para CADA bono usa esta estructura:

## BONO [N]: [Nombre atractivo del bono]

| Aspecto | Detalle |
|---------|---------|
| Qué incluye exactamente | (mínimo 3 ítems concretos) |
| Beneficio específico | (algo que NO ofrece el producto base) |
| Formato | (Notion / PDF / Google Sheets / Video / etc.) |
| Por qué lo quieren igual | (aunque ya tengan el producto principal) |

**Tiempo de implementación:** [cuánto tarda el cliente en usarlo]

Escribe BONO 1, BONO 2, BONO 3, BONO 4, BONO 5 — todos completos.`;
}
