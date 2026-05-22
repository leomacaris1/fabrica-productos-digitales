import JSZip from 'jszip';
import { marked } from 'marked';
import { studio } from './production-studio.js';
import { buildMarkdown, buildJSON } from '../utils/download.js';

/**
 * Agente 3: Launch Manager
 * Genera la Landing Page y el Master ZIP Kit con todo el contenido de la fábrica.
 */
export class LaunchManager {
  constructor() {}

  /**
   * Construye el código HTML de la Sales Page inyectando estilos CSS premium
   */
  buildSalesPageHtml(sessionData, customResults, language = 'es-latam') {
    const { productName, niche } = sessionData;
    const results = customResults || sessionData.results;
    
    const isEn = language === 'en-us';
    const textOffer = isEn ? '🔥 LIMITED OFFER' : '🔥 Oferta Limitada';
    const textDesc = isEn ? 'The definitive solution designed exclusively for:' : 'La solución definitiva diseñada exclusivamente para:';
    const textReady = isEn ? 'Ready to take action?' : '¿Listo para tomar acción?';
    const textP1 = isEn ? "Don't miss this opportunity to transform your reality today." : 'No dejes pasar esta oportunidad de transformar tu realidad hoy mismo.';
    const textBtn = isEn ? 'YES, I WANT ACCESS NOW' : 'SÍ, QUIERO ACCEDER AHORA';
    const textGuar = isEn ? '🔒 100% Secure & Guaranteed Payment' : '🔒 Pago 100% seguro y garantizado';
    const textRights = isEn ? 'All rights reserved.' : 'Todos los derechos reservados.';
    const textBrand = productName || (isEn ? 'Your Brand' : 'Tu Marca');
    const defaultTitle = productName || (isEn ? 'Discover Your Next Level' : 'Descubre Tu Próximo Nivel');
    const defaultSalesCopy = isEn ? '# Landing Page Title\n\nYour sales page content goes here...' : '# Título de la Landing\n\nAquí va el contenido de tu página de ventas...';

    // El paso de la Sales Page es el 7
    const salesCopyMd = results[7] || defaultSalesCopy;
    
    // Limpiamos la cabecera del agente de QA (todo lo que esté antes del verdadero BLOQUE 1)
    let cleanMd = salesCopyMd.trim();
    
    // Buscamos la línea que inicia el BLOQUE 1 como cabecera (precedido solo por símbolos markdown o espacios)
    const matchBloque1 = cleanMd.match(/(?:^|\n)([\s#*_-]*)BLOQUE\s*(?:01|1)\b/i);
    if (matchBloque1) {
      const startIndex = matchBloque1.index + (matchBloque1[0].startsWith('\n') ? 1 : 0);
      cleanMd = cleanMd.substring(startIndex);
    } else {
      // Coincidencia más laxa por si acaso
      const matchBloque1Lax = cleanMd.match(/BLOQUE\s*1/i);
      if (matchBloque1Lax) {
        cleanMd = cleanMd.substring(matchBloque1Lax.index);
      }
    }
    
    // Eliminación proactiva de cabeceras de QA o metadatos remanentes al inicio
    cleanMd = cleanMd.replace(/^(?:#|\s)*✅?\s*(?:RESULTADO|CONTENIDO|SALES PAGE|AN[AÁ]LISIS|REVISADO)[\s\S]*?(?=\n\n|\n##|\nBLOQUE)/i, '').trim();
    
    // Limpiamos las etiquetas técnicas de bloques (ej. ## BLOQUE 1 - HERO) para que no ensucien el diseño
    cleanMd = cleanMd.replace(/^#*\s*BLOQUE\s*\d+\s*[-—:].*$/gim, '').trim();

    // Limpiamos etiquetas estáticas como HEADLINE: o SUBHEADLINE: o PAIN POINTS:
    cleanMd = cleanMd.replace(/^\s*(?:HEADLINE|SUBHEADLINE|PAIN POINTS|PUNTOS DE DOLOR)[^:]*:\s*/gim, '');
    cleanMd = cleanMd.replace(/^\s*\*\*(?:HEADLINE|SUBHEADLINE|PAIN POINTS|PUNTOS DE DOLOR)[^:]*:\*\*\s*/gim, '');
    
    // Convertimos el Markdown del agente a HTML
    const salesHtml = marked.parse(cleanMd).replace(/^.*(Aquí tienes|Claro|¡Claro que sí).*$/gim, '').trim();
    
    return `<!DOCTYPE html>
<html lang="${isEn ? 'en' : 'es'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${productName || 'Sales Page'} - ${isEn ? 'Exclusive Offer' : 'Oferta Exclusiva'}</title>
  <meta name="description" content="${isEn ? 'For' : 'Para'}: ${niche}">
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
  <style>
    /* CSS INYECTADO DIRECTAMENTE PARA EVITAR PROBLEMAS DE RUTAS AL ABRIR EL ZIP */
    :root {
      --primary: #4f46e5;
      --primary-gradient: linear-gradient(135deg, #1e1b4b 0%, #4f46e5 100%);
      --accent: #10b981;
      --accent-gradient: linear-gradient(135deg, #059669 0%, #10b981 100%);
      --bg-color: #f8fafc;
      --text-main: #0f172a;
      --text-muted: #475569;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      font-family: 'Outfit', system-ui, sans-serif;
      color: var(--text-main);
      background-color: var(--bg-color);
      line-height: 1.7;
      -webkit-font-smoothing: antialiased;
    }

    /* --- HERO SECTION --- */
    .hero {
      background: var(--primary-gradient);
      color: white;
      padding: 100px 20px 140px 20px;
      text-align: center;
      position: relative;
    }

    .hero::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 50px;
      background: var(--bg-color);
      clip-path: polygon(0 100%, 100% 100%, 100% 0);
    }

    .hero-content {
      max-width: 800px;
      margin: 0 auto;
    }

    .badge {
      display: inline-block;
      background: rgba(255, 255, 255, 0.2);
      padding: 8px 16px;
      border-radius: 50px;
      font-weight: 600;
      font-size: 0.9rem;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 20px;
      backdrop-filter: blur(10px);
    }

    .hero h1 {
      font-size: 3.5rem;
      font-weight: 800;
      margin: 0 0 20px 0;
      line-height: 1.1;
      letter-spacing: -1px;
    }

    .hero p {
      font-size: 1.3rem;
      opacity: 0.9;
      font-weight: 300;
    }

    /* --- MAIN CONTENT (Elevated Card) --- */
    .container {
      max-width: 850px;
      margin: -80px auto 60px auto;
      background: white;
      padding: 60px;
      border-radius: 20px;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15);
      position: relative;
      z-index: 10;
    }

    .sales-content h1 {
      /* En caso de que el markdown traiga un H1, lo hacemos un poco más chico que el Hero */
      font-size: 2.5rem;
      color: var(--primary);
      text-align: center;
      margin-bottom: 30px;
    }

    .sales-content h2 {
      font-size: 2rem;
      color: var(--text-main);
      margin-top: 3rem;
      border-bottom: 3px solid #f1f5f9;
      padding-bottom: 10px;
    }

    .sales-content h3 {
      font-size: 1.5rem;
      color: var(--primary);
      margin-top: 2rem;
    }

    .sales-content p {
      font-size: 1.15rem;
      color: var(--text-muted);
      margin-bottom: 20px;
    }

    .sales-content blockquote {
      background: #f8fafc;
      border-left: 5px solid var(--accent);
      padding: 25px;
      margin: 30px 0;
      font-size: 1.25rem;
      font-style: italic;
      color: #334155;
      border-radius: 0 12px 12px 0;
    }

    .sales-content ul {
      list-style: none;
      padding: 0;
      margin: 30px 0;
    }

    .sales-content li {
      margin-bottom: 15px;
      padding-left: 40px;
      position: relative;
      font-size: 1.15rem;
      color: var(--text-muted);
    }

    .sales-content li::before {
      content: '👉';
      position: absolute;
      left: 0;
      top: 2px;
    }

    /* Tablas de Markdown */
    .sales-content table {
      width: 100%;
      border-collapse: collapse;
      margin: 30px 0;
      background: white;
      box-shadow: 0 4px 15px -3px rgba(0,0,0,0.1);
      border-radius: 12px;
      overflow: hidden;
    }
    .sales-content th, .sales-content td {
      padding: 18px 20px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
      font-size: 1.1rem;
    }
    .sales-content th {
      background: var(--primary-gradient);
      color: white;
      font-weight: 600;
    }
    .sales-content tr:last-child td {
      border-bottom: none;
    }
    .sales-content tr:nth-child(even) {
      background-color: #f8fafc;
    }

    /* --- CTA BOX (Bottom) --- */
    .cta-box {
      background: var(--accent-gradient);
      color: white;
      text-align: center;
      padding: 60px 40px;
      border-radius: 20px;
      margin-top: 60px;
      box-shadow: 0 20px 25px -5px rgba(16, 185, 129, 0.3);
    }

    .cta-box h3 {
      font-size: 2.2rem;
      margin: 0 0 15px 0;
      color: white;
    }

    .cta-box p {
      font-size: 1.2rem;
      opacity: 0.9;
      margin-bottom: 30px;
    }

    .btn-buy {
      display: inline-block;
      background-color: white;
      color: var(--text-main);
      font-size: 1.3rem;
      font-weight: 800;
      padding: 20px 50px;
      border: none;
      border-radius: 50px;
      cursor: pointer;
      text-transform: uppercase;
      letter-spacing: 1px;
      transition: all 0.3s ease;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
    }

    .btn-buy:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2);
      color: var(--primary);
    }

    .guarantee {
      margin-top: 20px;
      font-size: 0.9rem;
      opacity: 0.8;
    }

    /* --- FOOTER --- */
    footer {
      text-align: center;
      padding: 30px;
      color: var(--text-muted);
      font-size: 0.9rem;
    }

    /* --- RESPONSIVE --- */
    @media (max-width: 768px) {
      .hero h1 { font-size: 2.5rem; }
      .container {
        margin: -40px 15px 40px 15px;
        padding: 30px 20px;
      }
      .cta-box { padding: 40px 20px; }
      .btn-buy { font-size: 1.1rem; padding: 15px 30px; }
    }
  </style>
</head>
<body>
  
  <header class="hero">
    <div class="hero-content">
      <div class="badge">${textOffer}</div>
      <h1>${defaultTitle}</h1>
      <p>${textDesc} <strong>${niche}</strong></p>
    </div>
  </header>

  <main class="container">
    <div class="sales-content">
      ${salesHtml}
    </div>
    
    <div class="cta-box">
      <h3>${textReady}</h3>
      <p>${textP1}</p>
      <button class="btn-buy">${textBtn}</button>
      <p class="guarantee">${textGuar}</p>
    </div>
  </main>

  <footer>
    <p>&copy; ${new Date().getFullYear()} ${textBrand}. ${textRights}</p>
  </footer>

</body>
</html>`;
  }

  /**
   * Genera el archivo ZIP con solo la Sales Page
   */
  async generateSalesPageZip(sessionData) {
    const { productName } = sessionData;
    const indexHtml = this.buildSalesPageHtml(sessionData);
    
    const zip = new JSZip();
    zip.file('index.html', indexHtml);
    
    const content = await zip.generateAsync({ type: 'blob' });
    
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    const slug = (productName || 'landing').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    a.download = `${slug}-sales-page-premium.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Helper internal to populate a folder with the contents
   */
  _populateZipFolder(targetFolder, sessionData, customResults, language = 'es-latam') {
    const results = customResults || sessionData.results;
    
    // 0. Archivos Maestros en la Raíz
    const masterMd = buildMarkdown(results, { niche: sessionData.niche, productName: sessionData.productName });
    targetFolder.file('00_DOCUMENTO_MAESTRO_COMPLETO.md', masterMd);

    // 1. Carpeta de Estrategia y Nicho
    const folderEstrategia = targetFolder.folder('01_Estrategia_y_Nicho');
    if (results[1]) folderEstrategia.file('01_ideas_con_demanda.md', results[1]);
    if (results[2]) folderEstrategia.file('02_validacion_idea_ganadora.md', results[2]);

    // 2. Carpeta de eBook y Entregables
    const folderEbook = targetFolder.folder('02_Ebook_y_Academia');
    if (results[3]) folderEbook.file('03_esqueleto_outline.md', results[3]);
    if (results[4]) folderEbook.file('04_contenido_completo.md', results[4]);
    if (results[5]) folderEbook.file('05_bonos_premium.md', results[5]);
    
    // Plantilla Notion y Ebook Imprimible
    const fakeSession = { ...sessionData, results };
    const notionMd = studio.generateNotionMarkdown(fakeSession);
    folderEbook.file('plantilla_notion_completa.md', notionMd);
    
    const ebookHtml = studio.generateEbookHtml(fakeSession);
    folderEbook.file('ebook_completo_para_imprimir.html', ebookHtml);

    // 3. Carpeta de Branding y Posicionamiento
    const folderBranding = targetFolder.folder('03_Branding_y_Posicionamiento');
    if (results[6]) folderBranding.file('06_branding_completo.md', results[6]);
    if (results[8]) folderBranding.file('08_10_productos_de_una_idea.md', results[8]);

    // 4. Carpeta de Página de Ventas (Landing Page)
    const folderLanding = targetFolder.folder('04_Pagina_de_Ventas');
    const indexHtml = this.buildSalesPageHtml(fakeSession, results, language);
    folderLanding.file('index.html', indexHtml);

    // 5. Carpeta de Marketing y Redes
    const folderMarketing = targetFolder.folder('05_Marketing_y_Redes');
    if (results[9]) folderMarketing.file('09_contenido_de_promocion.md', results[9]);

    // 6. Carpeta de Escala e Inteligencia Artificial
    const folderEscala = targetFolder.folder('06_Escala_e_IA');
    if (results[10]) folderEscala.file('10_escala_y_contexto.md', results[10]);
  }

  /**
   * Genera un ZIP maestro ultra-estructurado con absolutamente TODOS los outputs
   */
  async generateMasterZip(sessionData) {
    const { productName, niche, results, stats } = sessionData;
    
    const zip = new JSZip();
    const slug = (productName || niche).toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (sessionData.isDual) {
      // Dual generation zip
      const folderEs = zip.folder('ES_LatAm');
      this._populateZipFolder(folderEs, sessionData, sessionData.results_es);
      
      const folderEn = zip.folder('EN_Global');
      this._populateZipFolder(folderEn, sessionData, sessionData.results_en, 'en-us');
      
      // JSON Backup master en la raíz
      const defaultStats = stats || { provider: sessionData.provider || 'gemini', cost: 0, inputTokens: 0, outputTokens: 0 };
      const masterJson = buildJSON(results, { niche, productName, idea: sessionData.idea || '' }, defaultStats);
      zip.file('backup_datos_proyecto.json', masterJson);
    } else {
      // Single generation zip
      this._populateZipFolder(zip, sessionData, results);
      
      const defaultStats = stats || { provider: sessionData.provider || 'gemini', cost: 0, inputTokens: 0, outputTokens: 0 };
      const masterJson = buildJSON(results, { niche, productName, idea: sessionData.idea || '' }, defaultStats);
      zip.file('backup_datos_proyecto.json', masterJson);
    }

    // Generar y descargar ZIP
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = sessionData.isDual ? `${slug}-master-kit-DUAL.zip` : `${slug}-master-kit-completo.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export const launchManager = new LaunchManager();
