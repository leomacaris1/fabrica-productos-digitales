export function buildPrompt({ niche, productName }, moduleNumber) {
  return `Producto: "${productName}" — Nicho: "${niche}"

Escribe el MÓDULO ${moduleNumber} completo con este esquema exacto:

# MÓDULO ${moduleNumber}: [título]

## Introducción
[2-3 párrafos motivadores que conecten con el lector y expliquen qué se logrará en este módulo]

## LECCIÓN ${moduleNumber}.1: [título]
**De qué va:** [1-2 párrafos]
**Por qué importa:** [1-2 párrafos]
**Ejemplo real del nicho "${niche}":** [caso concreto con datos realistas]
**Pasos concretos:**
1. ...
2. ...
3. ...
4. ...
**Ejercicio/Checklist:**
- [ ] ...
- [ ] ...
- [ ] ...
- [ ] ...

## LECCIÓN ${moduleNumber}.2: [título]
[misma estructura completa]

## LECCIÓN ${moduleNumber}.3: [título]
[misma estructura completa]

## Cierre del módulo
[1 párrafo que enlaza con el módulo ${moduleNumber < 5 ? moduleNumber + 1 : 'siguiente y lo que viene'}]

ESCRIBE LAS 3 LECCIONES COMPLETAS CON TODA SU ESTRUCTURA.`;
}
