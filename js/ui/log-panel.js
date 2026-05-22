/**
 * Add a log entry
 * @param {string} message
 * @param {string} type - 'writer' | 'qa' | 'continuation' | 'ok' | 'error'
 */
export function addLog(message, type = '') {
  const container = document.getElementById('logBody');
  if (!container) return;

  const time = new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const line = document.createElement('div');
  line.className = 'log-line';
  line.innerHTML = `
    <span class="log-ts">${time}</span>
    <span class="log-msg ${type}">${message}</span>
  `;

  container.appendChild(line);
  container.scrollTop = container.scrollHeight;
}

/**
 * Clear all log entries
 */
export function clearLog() {
  const container = document.getElementById('logBody');
  if (container) container.innerHTML = '';
}
