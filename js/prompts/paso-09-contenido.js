export function buildPrompt({ niche, productName }) {
  return `Kit de promoción para "${productName}" — Nicho: "${niche}"

Escribe ESTAS 4 SECCIONES COMPLETAS:

## SECCIÓN 1: 10 IDEAS DE POSTS
Tabla con EXACTAMENTE 10 filas:
| # | Tema | Gancho principal | Contenido clave | Red ideal |

## SECCIÓN 2: 10 HOOKS QUE FRENAN EL SCROLL
Lista numerada del 1 al 10. Cada hook en **negrita** + (tipo de hook entre paréntesis).
Escribe los 10.

## SECCIÓN 3: 10 CONCEPTOS DE VIDEO 30-60 SEG
Tabla con EXACTAMENTE 10 filas:
| # | Título del video | Qué muestra visualmente | Guión síntesis (2-3 frases) | CTA |

## SECCIÓN 4: 5 ÁNGULOS DE STORYTELLING
Para cada ángulo:
**Nombre del ángulo:** [nombre]
Narrativa: [3-4 oraciones completas listas para usar como hilo o carrusel]

ESCRIBE LAS 4 SECCIONES COMPLETAS incluyendo los 10 ítems de cada una.`;
}
