/**
 * Detect if LLM output was truncated
 * Uses multiple heuristics from V3 + JSX improvements
 * @param {string} text
 * @returns {boolean}
 */
export function isTruncated(text) {
  const t = text.trimEnd();
  if (t.length < 50) return false;
  
  const tail = t.slice(-300);
  const lastLine = tail.split('\n').pop().trim();

  // Ends with ellipsis
  if (tail.endsWith('...')) return true;
  // Ends with comma, semicolon, colon, dash
  if (/[,;:\-–]\s*$/.test(tail)) return true;
  // Ends with pipe (table row cut)
  if (/\|\s*$/.test(tail)) return true;
  // Last line is just table separator
  if (/^\|[\s\-|]+$/.test(lastLine)) return true;
  // Last line is numbered item with very short text (list cut)
  if (/^\d+\.\s*\w{0,20}$/.test(lastLine)) return true;
  // Last line is a heading with short text (section start but no content)
  if (/^#+\s+\w.{0,40}$/.test(lastLine) && lastLine.length < 60) return true;
  // Last 4 chars have no sentence-ending punctuation
  if (!/[.!?»")\]`]/.test(tail.slice(-4))) return true;

  return false;
}
