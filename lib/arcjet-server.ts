/**
 * Arcjet Protection for Next.js Server Actions
 *
 * This module provides rate limiting and security protection for server actions
 * using the Arcjet SDK. Since server actions don't have direct access to Request
 * objects like API routes do, we create mock requests with IP information extracted
 * from Next.js headers.
 */

import arcjet, { tokenBucket, shield } from "@arcjet/next";
import { headers } from "next/headers";

/**
 * Arcjet instance configured for server actions
 *
 * Rules:
 * - Shield: Protects against common attacks (SQL injection, XSS, etc.)
 * - Token Bucket: Rate limiting based on IP address
 *   - 5 tokens refilled every 10 seconds
 *   - Capacity of 10 tokens
 *   - Newsletter submissions consume 5 tokens (allows 2 per 10 seconds)
 *   - Admin actions consume 10 tokens (allows 1 per 10 seconds)
 */
export const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  characteristics: ["ip.src"], // Track requests by IP address
  rules: [
    // Shield protects against common attacks
    shield({ mode: "LIVE" }),

    // Token bucket rate limiting
    tokenBucket({
      mode: "LIVE",
      refillRate: 5,      // Refill 5 tokens per interval
      interval: 10,       // Every 10 seconds
      capacity: 10,       // Maximum 10 tokens in bucket
    }),
  ],
});

/**
 * Get the client's IP address from Next.js headers
 *
 * This function checks common headers used by reverse proxies and CDNs
 * to determine the original client IP address. It supports:
 * - x-forwarded-for (most common, used by Vercel, AWS, etc.)
 * - x-real-ip (Nginx)
 * - cf-connecting-ip (Cloudflare)
 *
 * @returns The client's IP address or 127.0.0.1 as fallback
 */
export async function getClientIP(): Promise<string> {
  const headersList = await headers();

  // Check x-forwarded-for header (most common)
  const forwardedFor = headersList.get("x-forwarded-for");
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs (client, proxy1, proxy2)
    // We want the first one (original client)
    return forwardedFor.split(",")[0].trim();
  }

  // Check x-real-ip header (Nginx)
  const realIP = headersList.get("x-real-ip");
  if (realIP) return realIP;

  // Check Cloudflare connecting IP
  const cfConnectingIP = headersList.get("cf-connecting-ip");
  if (cfConnectingIP) return cfConnectingIP;

  // Fallback for local development
  return "127.0.0.1";
}

/**
 * Create a mock Request object for Arcjet protection
 *
 * Server actions in Next.js don't have access to the Request object
 * like API routes do. Arcjet expects a Request object, so we create
 * a minimal mock request with the client's IP address in the headers.
 *
 * @returns A Request object that can be used with Arcjet's protect() method
 */
export async function createArcjetRequest(): Promise<Request> {
  const ip = await getClientIP();
  const headersList = await headers();

  // Get the referer URL or use localhost as fallback
  const url = headersList.get("referer") || "http://localhost:3000";
  const userAgent = headersList.get("user-agent") || "Unknown";

  // Create a minimal Request object with IP information
  return new Request(url, {
    method: "POST",
    headers: {
      "x-forwarded-for": ip,
      "user-agent": userAgent,
    },
  });
}

/**
 * Rate limit configuration presets for different types of actions
 */
export const RATE_LIMITS = {
  // Newsletter subscriptions: 5 tokens (allows 2 submissions per 10 seconds)
  NEWSLETTER: 5,

  // Admin actions: 10 tokens (allows 1 action per 10 seconds)
  ADMIN: 10,

  // Project creation: 5 tokens (allows 2 creations per 10 seconds)
  PROJECT: 5,

  // Database operations: 2 tokens (allows 5 operations per 10 seconds)
  DATABASE: 2,
} as const;
