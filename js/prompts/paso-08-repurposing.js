export function buildPrompt({ niche, productName }) {
  return `Producto base: "${productName}" — Nicho: "${niche}"

Reutiliza en EXACTAMENTE 10 FORMATOS. Escribe los 10. No pares antes del formato 10.

Para CADA formato:

## [N]. [Nombre del formato]
| Aspecto | Detalle |
|---------|---------|
| Nombre del producto | ... |
| Qué incluye | (mínimo 3 ítems concretos) |
| Precio sugerido | ... |
| Plataforma recomendada | ... |
| Esfuerzo de creación | bajo / medio / alto |
| Tiempo estimado para crearlo | ... |

Los 10 formatos:
1. Mini curso en video
2. Plantilla Notion standalone
3. Serie de carruseles Instagram
4. Lead magnet gratuito
5. Serie Reels/TikTok
6. Secuencia email 5 días
7. Workshop en vivo
8. Versión upsell/PRO
9. Programa de afiliados
10. Membership o comunidad privada

Escribe los 10 completos con sus tablas.`;
}
