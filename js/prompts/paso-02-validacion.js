export function buildPrompt({ niche, idea }) {
  return `Nicho: "${niche}". Producto seleccionado: "${idea}"

Escribe un análisis completo con ESTAS 5 SECCIONES. Completa TODAS.

## 1. PERFIL DEL CLIENTE IDEAL
Tabla detallada: Edad | Ingresos actuales | Ocupación | Ubicación | Psicografía (3 rasgos) | Dolor tangible específico

## 2. MOTIVACIONES DE COMPRA
EXACTAMENTE 5 motivaciones ordenadas por impacto emocional. Cada una con nombre en negrita y explicación de 2-3 líneas.

## 3. CUATRO OBJECIONES Y RESOLUCIONES
Las CUATRO objeciones completas, numeradas. Para cada una:
- La objeción (cómo la dice el cliente)
- La realidad detrás de esa objeción
- Resolución detallada (mínimo 3 puntos concretos)
- Frase clave para usar en marketing

## 4. QUÉ LA HARÍA MÁS VALIOSA
EXACTAMENTE 4 ideas concretas. Para cada una: qué se agregaría y cómo implementarlo.

## 5. POSICIONAMIENTO ÚNICO + PRECIO
Posicionamiento diferenciado (3-4 líneas) + precio con justificación detallada.

COMPLETA LAS 4 OBJECIONES. No pares en la 2 ni en la 3.`;
}
