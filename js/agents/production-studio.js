import { marked } from 'marked';

/**
 * Agente 2: Production Studio
 * Toma el output del Agente 1 y construye archivos finales.
 */

export class ProductionStudio {
  constructor() {
    this.html2pdfLoaded = false;
  }

  async loadHtml2Pdf() {
    if (this.html2pdfLoaded || window.html2pdf) return window.html2pdf;
    
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.onload = () => {
        this.html2pdfLoaded = true;
        resolve(window.html2pdf);
      };
      script.onerror = () => reject(new Error('No se pudo cargar html2pdf.js'));
      document.head.appendChild(script);
    });
  }

  /**
   * Genera el HTML para el eBook profesional (PDF)
   */
  generateEbookHtml(sessionData) {
    const { productName, niche, results } = sessionData;
    const outline = results[3] || '';
    const content = results[4] || '';
    const bonuses = results[5] || '';
    
    const markdownContent = `
# ${productName}
### Una guía diseñada para: ${niche}

---

## Índice y Estructura
${outline}

---

## Contenido Principal
${content}

---

## Bonos Premium
${bonuses}
    `;

    // Convert markdown to HTML
    const htmlBody = marked.parse(markdownContent);

    // Style the PDF
    return `
      <div id="ebook-content" style="font-family: 'DM Sans', sans-serif; color: #111; line-height: 1.6; max-width: 800px; margin: 0 auto; background-color: white; padding: 20px;">
        <style>
          h1 { color: #f59e0b; font-size: 36px; border-bottom: 2px solid #f59e0b; padding-bottom: 10px; margin-top: 40px; }
          h2 { color: #1e293b; font-size: 24px; margin-top: 30px; }
          h3 { color: #475569; font-size: 18px; margin-top: 20px; }
          p { margin-bottom: 15px; }
          ul, ol { margin-bottom: 15px; padding-left: 20px; }
          li { margin-bottom: 8px; }
          hr { border: 0; height: 1px; background: #e2e8f0; margin: 30px 0; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
          th { background: #f8fafc; }
          .page-break { page-break-before: always; }
        </style>
        ${htmlBody.replace(/<hr>/g, '<div class="page-break"></div>')}
      </div>
    `;
  }

  /**
   * Exporta a formato Notion (Markdown puro optimizado)
   */
  generateNotionMarkdown(sessionData) {
    const { productName, niche, results } = sessionData;
    
    return `# 📓 PLANTILLA NOTION: ${productName}

> **Nicho:** ${niche}
> Importa este archivo en Notion para tener todo tu contenido estructurado.

---
## 🗂️ Outline del Curso
${results[3] || 'No disponible'}

---
## ✍️ Contenido Completo
${results[4] || 'No disponible'}

---
## 🎁 Bonos
${results[5] || 'No disponible'}
`;
  }

  /**
   * Crea el PDF y lo descarga
   */
  async downloadPdf(htmlContent, filename) {
    const html2pdf = await this.loadHtml2Pdf();
    
    const element = document.createElement('div');
    element.innerHTML = htmlContent;
    
    const opt = {
      margin:       15,
      filename:     `${filename}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    await html2pdf().from(element).set(opt).save();
  }
}

export const studio = new ProductionStudio();
