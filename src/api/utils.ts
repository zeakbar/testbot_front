/**
 * Extract endpoint path and query string from a full URL
 * Handles both full URLs (http://...) and relative paths (/...)
 */
export function extractEndpoint(url: string): string {
  try {
    // If it's a full URL, parse it properly
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const urlObj = new URL(url);
      return urlObj.pathname + urlObj.search;
    }
    // If it's already a relative path, return as-is
    return url;
  } catch {
    // Fallback: return the URL as-is
    return url;
  }
}
