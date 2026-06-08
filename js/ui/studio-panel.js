import { loadSession as getSession, getLatestSessionId } from '../utils/session.js';
import { studio } from '../agents/production-studio.js';
import { launchManager } from '../agents/launch-manager.js';
import { downloadFile as downloadString, downloadAllMd, downloadAllJson } from '../utils/download.js';
import { toast } from './toast.js';

export class StudioPanel {
  constructor(appRef) {
    this.app = appRef;
    
    // UI Elements
    this.tabConceptoBtn = document.querySelector('[data-tab="tabConcepto"]');
    this.tabProduccionBtn = document.querySelector('[data-tab="tabProduccion"]');
    this.tabConceptoView = document.getElementById('tabConcepto');
    this.tabProduccionView = document.getElementById('tabProduccion');
    
    this.btnGoToStudio = document.getElementById('btnGoToStudio');
    this.btnBuildEbook = document.getElementById('btnBuildEbook');
    this.btnBuildNotion = document.getElementById('btnBuildNotion');
    this.btnBuildSalesPage = document.getElementById('btnBuildSalesPage');
    this.btnDownloadPdf = document.getElementById('btnDownloadPdf');
    
    // Master Kit Elements
    this.btnBuildMasterZip = document.getElementById('btnBuildMasterZip');
    this.btnDlAllMd = document.getElementById('btnDlAllMd');
    this.btnDlAllJson = document.getElementById('btnDlAllJson');
    
    this.studioPreviewArea = document.getElementById('studioPreviewArea');
    this.pdfContainer = document.getElementById('pdfContainer');
    
    this.currentHtmlPdf = '';
    
    this.bindEvents();
    
    // Si hay una sesión guardada, habilitar la pestaña del Studio por defecto
    if (getLatestSessionId()) {
      this.enableStudioTab();
    }
  }

  bindEvents() {
    if (this.tabConceptoBtn) this.tabConceptoBtn.onclick = () => this.switchTab('tabConcepto');
    if (this.tabProduccionBtn) this.tabProduccionBtn.onclick = () => this.switchTab('tabProduccion');
    if (this.btnGoToStudio) this.btnGoToStudio.onclick = () => this.switchTab('tabProduccion');
    
    if (this.btnBuildEbook) this.btnBuildEbook.onclick = () => this.previewEbook();
    if (this.btnBuildNotion) this.btnBuildNotion.onclick = () => this.downloadNotion();
    if (this.btnBuildSalesPage) this.btnBuildSalesPage.onclick = () => this.downloadSalesPage();
    if (this.btnDownloadPdf) this.btnDownloadPdf.onclick = () => this.downloadPdf();
    
    // Master Kit Binds
    if (this.btnBuildMasterZip) this.btnBuildMasterZip.onclick = () => this.downloadMasterZip();
    if (this.btnDlAllMd) this.btnDlAllMd.onclick = () => this.downloadMasterMd();
    if (this.btnDlAllJson) this.btnDlAllJson.onclick = () => this.downloadMasterJson();
  }

  switchTab(tabId) {
    if (tabId === 'tabProduccion') {
      const sessionId = getLatestSessionId();
      if (!sessionId) {
        toast.warning('No hay una sesión completa para pasar al Studio.');
        return;
      }
      this.tabProduccionBtn.removeAttribute('disabled');
    }
    
    // Toggle active classes
    this.tabConceptoBtn.classList.toggle('active', tabId === 'tabConcepto');
    this.tabProduccionBtn.classList.toggle('active', tabId === 'tabProduccion');
    
    // Toggle views
    this.tabConceptoView.style.display = tabId === 'tabConcepto' ? 'block' : 'none';
    this.tabProduccionView.style.display = tabId === 'tabProduccion' ? 'block' : 'none';
  }

  enableStudioTab() {
    if (this.tabProduccionBtn) this.tabProduccionBtn.removeAttribute('disabled');
  }

  previewEbook() {
    const sessionId = getLatestSessionId();
    if (!sessionId) return;
    
    const session = getSession(sessionId);
    if (!session || !session.results) return;
    
    this.btnBuildEbook.innerHTML = '<span class="animate-spin" style="display:inline-block;margin-right:5px">⏳</span> Generando preview...';
    this.btnBuildEbook.disabled = true;
    
    try {
      this.currentHtmlPdf = studio.generateEbookHtml(session);
      this.pdfContainer.innerHTML = this.currentHtmlPdf;
      this.pdfContainer.classList.add('has-content');
      this.studioPreviewArea.style.display = 'block';
    } catch (e) {
      toast.error('Error renderizando HTML: ' + e.message);
    } finally {
      this.btnBuildEbook.innerHTML = 'Generar eBook Profesional (PDF)';
      this.btnBuildEbook.disabled = false;
    }
  }

  downloadNotion() {
    const sessionId = getLatestSessionId();
    if (!sessionId) return;
    
    const session = getSession(sessionId);
    if (!session || !session.results) return;
    
    const markdown = studio.generateNotionMarkdown(session);
    const slug = (session.productName || 'notion-template').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    downloadString(markdown, 'text/markdown', `${slug}-notion.md`);
    toast.success('Plantilla de Notion descargada');
  }

  downloadSalesPage() {
    const sessionId = getLatestSessionId();
    if (!sessionId) return;
    
    const session = getSession(sessionId);
    if (!session || !session.results) return;
    
    this.btnBuildSalesPage.innerHTML = '<span class="animate-spin" style="display:inline-block;margin-right:5px">⏳</span> Generando ZIP...';
    this.btnBuildSalesPage.disabled = true;
    
    launchManager.generateSalesPageZip(session)
      .then(() => toast.success('Sales Page descargada con éxito 🚀'))
      .catch(e => toast.error('Error generando página de ventas: ' + e.message))
      .finally(() => {
        this.btnBuildSalesPage.innerHTML = 'Generar Sales Page (ZIP)';
        this.btnBuildSalesPage.disabled = false;
      });
  }

  async downloadPdf() {
    if (!this.currentHtmlPdf) return;
    
    const sessionId = getLatestSessionId();
    const session = getSession(sessionId);
    const slug = (session?.productName || 'ebook').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    this.btnDownloadPdf.innerText = 'Descargando...';
    this.btnDownloadPdf.disabled = true;
    
    try {
      await studio.downloadPdf(this.currentHtmlPdf, slug);
      toast.success('PDF exportado correctamente');
    } catch (e) {
      toast.error('Error descargando PDF: ' + e.message);
    } finally {
      this.btnDownloadPdf.innerText = 'Descargar PDF Final';
      this.btnDownloadPdf.disabled = false;
    }
  }

  downloadMasterZip() {
    const sessionId = getLatestSessionId();
    if (!sessionId) return;
    
    const session = getSession(sessionId);
    if (!session || !session.results) return;
    
    this.btnBuildMasterZip.innerHTML = '<span class="animate-spin" style="display:inline-block;margin-right:5px">⏳</span> Generando Master ZIP...';
    this.btnBuildMasterZip.disabled = true;
    
    launchManager.generateMasterZip(session)
      .then(() => toast.success('Master ZIP Kit exportado con éxito 👑'))
      .catch(e => toast.error('Error generando Master ZIP: ' + e.message))
      .finally(() => {
        this.btnBuildMasterZip.innerHTML = '📦 Descargar Master ZIP Kit';
        this.btnBuildMasterZip.disabled = false;
      });
  }

  downloadMasterMd() {
    const sessionId = getLatestSessionId();
    if (!sessionId) return;
    
    const session = getSession(sessionId);
    if (!session || !session.results) return;
    
    downloadAllMd(session.results, { niche: session.niche, productName: session.productName });
  }

  downloadMasterJson() {
    const sessionId = getLatestSessionId();
    if (!sessionId) return;
    
    const session = getSession(sessionId);
    if (!session || !session.results) return;
    
    const stats = session.stats || {
      provider: session.provider || 'gemini',
      cost: 0,
      inputTokens: 0,
      outputTokens: 0
    };
    downloadAllJson(session.results, { niche: session.niche, productName: session.productName, idea: session.idea }, stats);
  }
}
