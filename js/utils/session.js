const STORAGE_PREFIX = 'fabrica_session_';

/**
 * Generate a unique session ID
 */
export function generateSessionId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

/**
 * Save session state to localStorage
 */
export function saveSession(sessionId, data) {
  try {
    localStorage.setItem(STORAGE_PREFIX + sessionId, JSON.stringify({
      ...data,
      lastUpdate: new Date().toISOString(),
    }));
    // Also save as 'latest' for quick recovery
    localStorage.setItem(STORAGE_PREFIX + 'latest', sessionId);
  } catch (e) {
    console.warn('Could not save session:', e);
  }
}

/**
 * Load session from localStorage
 */
export function loadSession(sessionId) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + sessionId);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn('Could not load session:', e);
    return null;
  }
}

/**
 * Get the latest session ID
 */
export function getLatestSessionId() {
  return localStorage.getItem(STORAGE_PREFIX + 'latest');
}

/**
 * List all saved sessions
 */
export function listSessions() {
  const sessions = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(STORAGE_PREFIX) && key !== STORAGE_PREFIX + 'latest') {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        sessions.push({
          id: key.replace(STORAGE_PREFIX, ''),
          niche: data.niche,
          productName: data.productName,
          status: data.status,
          lastUpdate: data.lastUpdate,
          completedSteps: Object.keys(data.results || {}).length,
        });
      } catch (e) { /* skip corrupted */ }
    }
  }
  return sessions.sort((a, b) => new Date(b.lastUpdate) - new Date(a.lastUpdate));
}

/**
 * Delete a session
 */
export function deleteSession(sessionId) {
  localStorage.removeItem(STORAGE_PREFIX + sessionId);
}

/**
 * Clear all sessions
 */
export function clearAllSessions() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(STORAGE_PREFIX)) keys.push(key);
  }
  keys.forEach(k => localStorage.removeItem(k));
}
