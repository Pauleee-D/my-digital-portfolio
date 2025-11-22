/**
 * Input Sanitization Utilities
 *
 * Provides functions to sanitize user input and prevent XSS attacks,
 * especially for JSON fields that store user-generated content.
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize a string to prevent XSS attacks
 *
 * Removes or escapes potentially malicious HTML/JavaScript code
 * while preserving safe content.
 *
 * @param input - The string to sanitize
 * @param maxLength - Maximum allowed length (default: 500 characters)
 * @returns Sanitized string, truncated if necessary
 */
export function sanitizeString(input: string, maxLength: number = 500): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Trim whitespace
  let sanitized = input.trim();

  // Enforce maximum length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  // Use DOMPurify to remove malicious content
  // This strips out <script>, <iframe>, onclick handlers, etc.
  sanitized = DOMPurify.sanitize(sanitized, {
    ALLOWED_TAGS: [], // Don't allow any HTML tags
    ALLOWED_ATTR: [], // Don't allow any attributes
    KEEP_CONTENT: true, // Keep the text content
  });

  return sanitized;
}

/**
 * Sanitize an array of strings
 *
 * Applies string sanitization to each item in the array,
 * removes empty strings, and enforces a maximum array length.
 *
 * @param items - Array of strings to sanitize
 * @param maxItems - Maximum number of items allowed (default: 100)
 * @param maxLength - Maximum length per item (default: 500)
 * @returns Sanitized array
 */
export function sanitizeStringArray(
  items: string[],
  maxItems: number = 100,
  maxLength: number = 500
): string[] {
  if (!Array.isArray(items)) {
    return [];
  }

  // Sanitize each item
  let sanitized = items
    .map(item => sanitizeString(item, maxLength))
    .filter(item => item.length > 0); // Remove empty strings

  // Enforce maximum array length
  if (sanitized.length > maxItems) {
    sanitized = sanitized.slice(0, maxItems);
  }

  return sanitized;
}

/**
 * Sanitize JSON data for storage
 *
 * Recursively sanitizes all string values in a JSON-serializable object.
 * Useful for cleaning user input before storing in JSONB columns.
 *
 * @param data - The data to sanitize
 * @param maxDepth - Maximum nesting depth (default: 5)
 * @returns Sanitized data
 */
export function sanitizeJSON(data: any, maxDepth: number = 5): any {
  if (maxDepth <= 0) {
    return null; // Prevent infinite recursion
  }

  if (typeof data === 'string') {
    return sanitizeString(data);
  }

  if (Array.isArray(data)) {
    return data
      .map(item => sanitizeJSON(item, maxDepth - 1))
      .filter(item => item !== null);
  }

  if (typeof data === 'object' && data !== null) {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      const sanitizedKey = sanitizeString(key, 100);
      sanitized[sanitizedKey] = sanitizeJSON(value, maxDepth - 1);
    }
    return sanitized;
  }

  // Numbers, booleans, null pass through
  return data;
}

/**
 * Validate and sanitize email address
 *
 * @param email - Email address to validate
 * @returns Sanitized email or null if invalid
 */
export function sanitizeEmail(email: string): string | null {
  if (!email || typeof email !== 'string') {
    return null;
  }

  // Remove whitespace
  const trimmed = email.trim().toLowerCase();

  // Enforce maximum length (emails shouldn't be longer than 320 chars)
  if (trimmed.length > 320) {
    return null;
  }

  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return null;
  }

  // DOMPurify to prevent XSS in email field
  const sanitized = DOMPurify.sanitize(trimmed, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });

  return sanitized;
}

/**
 * Check if a string contains potentially malicious patterns
 *
 * @param input - String to check
 * @returns true if suspicious patterns detected
 */
export function containsSuspiciousPatterns(input: string): boolean {
  if (!input || typeof input !== 'string') {
    return false;
  }

  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // onclick, onerror, etc.
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /eval\(/i,
    /expression\(/i,
  ];

  return suspiciousPatterns.some(pattern => pattern.test(input));
}
