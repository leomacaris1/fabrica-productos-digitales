/**
 * Fetch with automatic retries and exponential backoff
 * Handles rate-limits (429) and server errors (5xx) gracefully
 */

const RETRYABLE_STATUS_CODES = [429, 500, 502, 503, 529];

/**
 * @param {string} url
 * @param {RequestInit} options - Standard fetch options
 * @param {Object} [retryConfig]
 * @param {number} [retryConfig.maxRetries=3]
 * @param {number} [retryConfig.baseDelay=1000] - Base delay in ms
 * @param {function} [retryConfig.onRetry] - Callback(attempt, delay, error)
 * @returns {Promise<Response>}
 */
export async function fetchWithRetry(url, options = {}, retryConfig = {}) {
  const { maxRetries = 3, baseDelay = 1000, onRetry } = retryConfig;

  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      // If response is OK or not retryable, return it
      if (response.ok || !RETRYABLE_STATUS_CODES.includes(response.status)) {
        return response;
      }

      // Retryable error
      const errorText = await response.text().catch(() => `HTTP ${response.status}`);
      lastError = new Error(`API Error ${response.status}: ${errorText.substring(0, 200)}`);
      lastError.status = response.status;

      // Check for Retry-After header (some APIs send it)
      const retryAfter = response.headers.get('retry-after');

      if (attempt < maxRetries) {
        const delay = retryAfter
          ? parseInt(retryAfter, 10) * 1000
          : baseDelay * Math.pow(2, attempt); // exponential: 1s, 2s, 4s

        if (onRetry) {
          onRetry(attempt + 1, delay, lastError);
        }

        await sleep(delay);
      }
    } catch (networkError) {
      // Network errors (fetch itself failed)
      lastError = networkError;

      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);

        if (onRetry) {
          onRetry(attempt + 1, delay, networkError);
        }

        await sleep(delay);
      }
    }
  }

  throw lastError || new Error('Request failed after retries');
}

/**
 * @param {number} ms
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
