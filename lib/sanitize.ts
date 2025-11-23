/**
 * Input Sanitization Utilities
 *
 * Provides functions to sanitize user input and prevent XSS attacks,
 * especially for JSON fields that store user-generated content.
 *
 * Uses regex-based sanitization to avoid build-time issues with DOMPurify
 */

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

  // Remove HTML tags and dangerous patterns
  sanitized = sanitized
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')   // Remove style tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframes
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '') // Remove object tags
    .replace(/<embed\b[^<]*>/gi, '')                                    // Remove embed tags
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')                       // Remove event handlers
    .replace(/on\w+\s*=\s*[^\s>]*/gi, '')                              // Remove event handlers without quotes
    .replace(/javascript:/gi, '')                                       // Remove javascript: protocol
    .replace(/<[^>]*>/g, '');                                           // Remove all remaining HTML tags

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

  return items
    .slice(0, maxItems)
    .map(item => sanitizeString(item, maxLength))
    .filter(item => item.length > 0);
}

/**
 * Recursively sanitize JSON objects
 *
 * Sanitizes all string values in a JSON object, including nested objects and arrays.
 * Limits nesting depth to prevent DoS attacks.
 *
 * @param obj - JSON object to sanitize
 * @param maxDepth - Maximum nesting depth (default: 5)
 * @param currentDepth - Current depth (used internally for recursion)
 * @returns Sanitized JSON object
 */
export function sanitizeJSON(obj: any, maxDepth: number = 5, currentDepth: number = 0): any {
  if (currentDepth >= maxDepth) {
    return null; // Prevent deeply nested objects
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeJSON(item, maxDepth, currentDepth + 1));
  }

  if (typeof obj === 'object' && obj !== null) {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[sanitizeString(key, 100)] = sanitizeJSON(obj[key], maxDepth, currentDepth + 1);
      }
    }
    return sanitized;
  }

  return obj; // Return numbers, booleans, null as-is
}

/**
 * Check if a string contains suspicious patterns that might indicate an attack
 *
 * @param input - String to check
 * @returns true if suspicious patterns are detected
 */
export function containsSuspiciousPatterns(input: string): boolean {
  if (!input || typeof input !== 'string') {
    return false;
  }

  const suspiciousPatterns = [
    /<script/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /javascript:/i,
    /on\w+\s*=/i,           // Event handlers like onclick=
    /eval\s*\(/i,
    /expression\s*\(/i,
    /<link/i,
    /<meta/i,
  ];

  return suspiciousPatterns.some(pattern => pattern.test(input));
}

/**
 * Sanitize email address
 *
 * Validates and sanitizes an email address.
 * Returns empty string if invalid.
 *
 * @param email - Email address to sanitize
 * @returns Sanitized email or empty string if invalid
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return '';
  }

  const sanitized = email.trim().toLowerCase();

  // Basic email validation regex
  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;

  if (!emailRegex.test(sanitized) || sanitized.length > 320) {
    return '';
  }

  return sanitized;
}
