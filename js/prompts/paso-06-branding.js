export function buildPrompt({ niche, productName }) {
  return `Producto: "${productName}" — Nicho: "${niche}"

Branding completo con ESTAS 5 SECCIONES. Completa TODAS.

## 1. CINCO TÍTULOS
Tabla: # | Título completo | Ángulo | Por qué funciona
Ángulos requeridos: emocional, resultado, método, urgencia, curiosidad (uno por fila).

## 2. TRES SUBTÍTULOS
Para cada uno: el subtítulo completo + explicación de por qué funciona (2-3 líneas).

## 3. TRES TAGLINES
Tabla: Tagline (máx 10 palabras) | Tono | Cuándo usarlo

## 4. TRES CONCEPTOS DE PORTADA
Para CADA concepto (los 3 completos):
- **Nombre del concepto**
- Paleta de colores (con códigos hex o referencias)
- Tipografía (familia + peso)
- Elementos visuales principales
- Mood / sensación que transmite
- A quién atrae

## 5. GUÍA DE ESTILO DE MARCA
Tabla: Aspecto | Cómo ES | Cómo NO ES (mínimo 6 filas)
Luego: palabras a usar (lista) | palabras a evitar (lista) | referencias de marcas similares.

COMPLETA LAS 5 SECCIONES. No pares después de la sección 3.`;
}
