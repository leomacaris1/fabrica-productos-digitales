/**
 * Semantic validation per step
 * Checks if the generated content has the expected structure
 * @param {number} stepId
 * @param {string} content
 * @returns {{valid: boolean, message: string}}
 */
export function validateStep(stepId, content) {
  const validators = {
    1: () => {
      const count = (content.match(/\|\s*(?:Audiencia|Elemento)\s*\|/gi) || []).length;
      if (count < 8) return { valid: false, message: `Solo ${count}/10 ideas detectadas` };
      if (!/IDEA GANADORA/i.test(content)) return { valid: false, message: 'Falta IDEA GANADORA' };
      return { valid: true, message: '10 ideas + ganadora ✓' };
    },
    2: () => {
      const sections = ['PERFIL', 'MOTIVACIONES', 'OBJECIONES', 'VALIOSA', 'POSICIONAMIENTO'];
      const found = sections.filter(s => content.toUpperCase().includes(s));
      if (found.length < 4) return { valid: false, message: `Solo ${found.length}/5 secciones` };
      return { valid: true, message: '5 secciones ✓' };
    },
    3: () => {
      const modules = (content.match(/MÓDULO\s+\d+/gi) || []).length;
      if (modules < 4) return { valid: false, message: `Solo ${modules}/5 módulos` };
      if (!/NOMBRE OFICIAL/i.test(content)) return { valid: false, message: 'Falta NOMBRE OFICIAL' };
      return { valid: true, message: '5 módulos + nombre ✓' };
    },
    4: () => {
      // Como el orquestador valida cada módulo por separado, esperamos 3 lecciones por módulo
      const lessons = (content.match(/Lección\s+\d+\.\d+/gi) || content.match(/LECCIÓN\s+\d+\.\d+/gi) || []).length;
      if (lessons < 3) return { valid: false, message: `Solo ${lessons}/3 lecciones del módulo` };
      return { valid: true, message: `${lessons} lecciones ✓` };
    },
    5: () => {
      const bonos = (content.match(/BONO\s+\d+/gi) || []).length;
      if (bonos < 4) return { valid: false, message: `Solo ${bonos}/5 bonos` };
      return { valid: true, message: '5 bonos ✓' };
    },
    6: () => {
      const sections = (content.match(/##\s+\d+\./g) || []).length;
      if (sections < 4) return { valid: false, message: `Solo ${sections}/5 secciones` };
      return { valid: true, message: '5 secciones ✓' };
    },
    7: () => {
      const bloques = (content.match(/BLOQUE\s+\d+/gi) || []).length;
      if (bloques < 8) return { valid: false, message: `Solo ${bloques}/10 bloques` };
      return { valid: true, message: '10 bloques ✓' };
    },
    8: () => {
      const formatos = (content.match(/##\s+\[?\d+/g) || content.match(/##\s+\d+\./g) || []).length;
      if (formatos < 8) return { valid: false, message: `Solo ${formatos}/10 formatos` };
      return { valid: true, message: '10 formatos ✓' };
    },
    9: () => {
      const hasStory = /storytelling|ángulo/i.test(content);
      const hasHooks = /hook/i.test(content);
      if (!hasStory || !hasHooks) return { valid: false, message: 'Faltan secciones' };
      return { valid: true, message: '4 secciones ✓' };
    },
    10: () => {
      const prompts = (content.match(/\*\*Nombre:\*\*/gi) || content.match(/\*\*Prompt completo/gi) || []).length;
      if (prompts < 3) return { valid: false, message: `Solo ${prompts}/5 prompts` };
      return { valid: true, message: '5 secciones + prompts ✓' };
    },
  };

  const validator = validators[stepId];
  if (!validator) return { valid: true, message: 'Sin validación específica' };
  return validator();
}

/**
 * Limpia el contenido generado por los agentes para remover preámbulos, saludos,
 * conversaciones, y reportes de QA/meta-mensajes.
 * @param {string} text
 * @param {number} stepId
 * @returns {string}
 */
export function cleanAgentOutput(text, stepId) {
  if (!text) return '';
  let clean = text.trim();
  
  // Paso 7: Sales Page (Landing)
  if (stepId === 7) {
    const matchBloque1 = clean.match(/(?:^|\n)([\s#*_-]*)BLOQUE\s*(?:01|1)\b/i);
    if (matchBloque1) {
      const startIndex = matchBloque1.index + (matchBloque1[0].startsWith('\n') ? 1 : 0);
      clean = clean.substring(startIndex);
    } else {
      // Limpieza proactiva del encabezado de QA si no detectamos el inicio riguroso
      clean = clean.replace(/^(?:#|\s)*✅?\s*(?:RESULTADO|CONTENIDO|SALES PAGE|AN[AÁ]LISIS|REVISADO)[\s\S]*?(?=\n\n|\n##|\nBLOQUE)/i, '').trim();
    }
  } else {
    // Para otros pasos, remover cabeceras de QA comunes si las hay al principio
    clean = clean.replace(/^(?:#|\s)*✅?\s*(?:RESULTADO|CONTENIDO|AN[AÁ]LISIS|REVISADO)[\s\S]*?(?=\n\n|\n##|\n#|\n\d+\.)/i, '').trim();
  }
  
  // Limpieza general de saludos o preámbulos de IA en cualquier paso
  clean = clean.replace(/^(?:Aquí tienes|Claro que sí|Por supuesto|¡Claro|A continuación|Aquí está|Hola)[\s\S]*?(?=\n\n|\n##|\n#|\n\d+\.)/i, '');
  
  return clean.trim();
}
