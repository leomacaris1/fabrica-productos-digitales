# 🏭 Fábrica de Productos Digitales v2.0

Bienvenido a la **Fábrica de Productos Digitales**, un sistema avanzado Multi-Agente impulsado por Inteligencia Artificial (Claude / Gemini) que automatiza la creación de negocios digitales completos a partir de una simple idea o nicho.

## 🚀 Características Principales

Este sistema orquesta a múltiples agentes expertos que colaboran secuencialmente para entregar un ecosistema digital premium:

- **Estrategia & Copy (Agente 1):** Investiga tu nicho, valida ideas ganadoras, escribe un eBook completo, crea los bonos, define el branding, redacta posts promocionales y más.
- **Production Studio (Agente 2):** Transforma el texto puro en entregables listos para usar (Exportación a PDF estructurado, Plantillas para Notion).
- **Launch Manager (Agente 3):** Escribe el código HTML/CSS de tu Landing Page (Página de Ventas) inyectando diseño premium y genera el **Master ZIP Kit** con todo el material compilado.
- **Ejecución Dual Localizada:** Permite ejecutar la creación del producto orientado 100% para el mercado hispano (LatAm) y para el mercado global (US) adaptando la jerga, el tono de venta y traduciendo la estructura.
- **Historial de Sesiones Local:** Todo se ejecuta en tu navegador (LocalStorage). Puedes retomar tus creaciones donde las dejaste.

## ⚙️ Cómo empezar (Local)

1. **Instala las dependencias:**
   ```bash
   npm install
   ```

2. **Inicia el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

3. **Inyecta tu API Key:**
   Abre `http://localhost:5174` (o el puerto que te indique Vite). Selecciona si prefieres el razonamiento de **Claude (Anthropic)** o **Gemini (Google)** e ingresa tu llave. Las llaves no se guardan en servidores externos, solo residen en la memoria de tu sesión actual.

4. **Escribe tu Nicho:**
   Ejemplo: *"Productividad para programadores freelance"*. ¡Dale a RUN y observa la magia suceder!

## 📦 Compilación para Producción

Para compilar y empaquetar la aplicación estática lista para subir a plataformas como Vercel o Netlify:
```bash
npm run build
```

## 🛠️ Tecnologías

- Vanilla JS (Arquitectura Modular por Agentes)
- Vite (Bundler y Server Local)
- HTML5 / CSS3 (Design Tokens Nativos)
- jszip (Compresión del lado del cliente)
- html2pdf.js / marked (Generación de Entregables)

---
*Diseñado bajo estándares de diseño moderno y copy de alto rendimiento.*
