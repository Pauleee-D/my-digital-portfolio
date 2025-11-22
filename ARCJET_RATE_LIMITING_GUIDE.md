# Arcjet Rate Limiting Implementation Guide

## Overview
This guide explains how to add Arcjet rate limiting to Next.js server actions to prevent spam and DoS attacks.

## Problem
Currently, server actions like `subscribeToNewsletter()` have no rate limiting. An attacker can spam unlimited requests:

```bash
# This would succeed indefinitely:
for i in {1..10000}; do
  curl -X POST http://localhost:3000 -d "email=spam$i@fake.com"
done
```

## Solution: 3 Implementation Approaches

---

## ✅ Option 1: Arcjet in Server Actions (RECOMMENDED)

### How It Works
1. Import Arcjet SDK in each server action file
2. Create Arcjet instance with rate limiting rules
3. Call `aj.protect()` before processing the request
4. Use IP address or user ID for tracking

### Pros
- ✅ Direct protection at the action level
- ✅ Fine-grained control per action
- ✅ Works with Next.js App Router
- ✅ Can use different limits per action

### Cons
- ⚠️ Server actions don't have direct access to IP addresses
- ⚠️ Need to pass request context manually

### Implementation

#### Step 1: Create Arcjet utility for server actions

**File: `lib/arcjet-server.ts`**
```typescript
import arcjet, { tokenBucket, shield, detectBot } from "@arcjet/next";
import { headers } from "next/headers";

// Create Arcjet instance for server actions
export const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    // Shield protection
    shield({ mode: "LIVE" }),

    // Newsletter rate limit: 3 submissions per hour per IP
    tokenBucket({
      mode: "LIVE",
      refillRate: 3,
      interval: 3600, // 1 hour
      capacity: 3,
      characteristics: ["ip.src"],
    }),
  ],
});

/**
 * Get client IP from Next.js headers
 * Used for rate limiting server actions
 */
export async function getClientIP(): Promise<string> {
  const headersList = await headers();

  // Check common IP headers (Vercel, Cloudflare, etc.)
  const forwardedFor = headersList.get("x-forwarded-for");
  const realIP = headersList.get("x-real-ip");
  const cfConnectingIP = headersList.get("cf-connecting-ip");

  // Return first available IP
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  if (realIP) return realIP;
  if (cfConnectingIP) return cfConnectingIP;

  // Fallback for development
  return "127.0.0.1";
}

/**
 * Create a mock request object for Arcjet protection in server actions
 * Arcjet expects a Request object, but server actions don't have one
 */
export async function createArcjetRequest(fingerprint?: string): Promise<Request> {
  const ip = await getClientIP();
  const headersList = await headers();

  // Create a minimal Request-like object
  const url = headersList.get("referer") || "http://localhost:3000";

  return new Request(url, {
    method: "POST",
    headers: {
      "x-forwarded-for": ip,
      "user-agent": headersList.get("user-agent") || "Unknown",
    },
  });
}
```

#### Step 2: Update newsletter action with rate limiting

**File: `app/actions/newsletter.ts`**
```typescript
"use server"

import { db, subscribers } from "@/lib/db"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { ActionState, newsletterSubscriptionSchema } from "@/lib/types"
import { isAdmin } from "@/lib/auth"
import { aj, createArcjetRequest } from "@/lib/arcjet-server" // ← Add this

export interface NewsletterState extends ActionState {
  email?: string;
  name?: string;
}

export async function subscribeToNewsletter(
  prevState: NewsletterState,
  formData: FormData
): Promise<NewsletterState> {
  // ✅ ARCJET RATE LIMITING - Add this before any processing
  try {
    const req = await createArcjetRequest();
    const decision = await aj.protect(req);

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return {
          status: "error",
          message: "Too many subscription attempts. Please try again later.",
        };
      }

      return {
        status: "error",
        message: "Request blocked for security reasons.",
      };
    }
  } catch (error) {
    console.error("Arcjet protection error:", error);
    // Continue anyway - don't block legitimate users if Arcjet fails
  }

  // Parse the form data
  const email = formData.get("email") as string
  const name = formData.get("name") as string

  // Validate the input with Zod schema
  const validationResult = newsletterSubscriptionSchema.safeParse({ email, name });
  if (!validationResult.success) {
    return {
      status: "error",
      message: validationResult.error.errors[0]?.message || "Invalid input data",
    }
  }

  try {
    // Check if email already exists
    const existingSubscriber = await db.select().from(subscribers).where(eq(subscribers.email, email))

    if (existingSubscriber.length > 0) {
      return {
        status: "error",
        message: "You are already subscribed to our newsletter",
        email,
        name,
      }
    }

    // Insert new subscriber
    await db.insert(subscribers).values({
      email,
      name: name || null,
    })

    revalidatePath("/")

    return {
      status: "success",
      message: "Thank you for subscribing to our newsletter!",
      email,
      name,
    }
  } catch (error) {
    console.error("Error subscribing to newsletter:", error)
    return {
      status: "error",
      message: "An error occurred while subscribing. Please try again.",
    }
  }
}
```

#### Step 3: Add rate limiting to admin actions

**File: `app/actions/admin.ts`**
```typescript
import { aj, createArcjetRequest } from "@/lib/arcjet-server";

export async function setUserRole(email: string, role: 'admin' | 'user'): Promise<ActionState> {
  // ✅ Rate limit admin actions (stricter limits)
  try {
    const req = await createArcjetRequest();
    const decision = await aj.protect(req, {
      requested: 10 // Use more tokens for admin actions
    });

    if (decision.isDenied()) {
      return {
        status: "error" as const,
        message: "Too many requests. Please slow down."
      };
    }
  } catch (error) {
    console.error("Arcjet protection error:", error);
  }

  try {
    const userIsAdmin = await isAdmin();
    if (!userIsAdmin) {
      return {
        status: "error" as const,
        message: "Unauthorized. Admin privileges required"
      };
    }

    // ... rest of the function
  } catch (error) {
    // ...
  }
}
```

---

## ✅ Option 2: Middleware Wrapper (Alternative)

### How It Works
Create a higher-order function that wraps server actions with Arcjet protection.

### Implementation

**File: `lib/with-rate-limit.ts`**
```typescript
import { aj, createArcjetRequest } from "./arcjet-server";
import { ActionState } from "./types";

/**
 * Higher-order function to add rate limiting to any server action
 * Usage: export const myAction = withRateLimit(async (prevState, formData) => { ... })
 */
export function withRateLimit<T extends ActionState>(
  action: (prevState: T, formData: FormData) => Promise<T>,
  options?: {
    tokensRequested?: number;
    errorMessage?: string;
  }
) {
  return async (prevState: T, formData: FormData): Promise<T> => {
    try {
      const req = await createArcjetRequest();
      const decision = await aj.protect(req, {
        requested: options?.tokensRequested || 1,
      });

      if (decision.isDenied()) {
        if (decision.reason.isRateLimit()) {
          return {
            ...prevState,
            status: "error" as const,
            message: options?.errorMessage || "Too many requests. Please try again later.",
          };
        }

        return {
          ...prevState,
          status: "error" as const,
          message: "Request blocked for security reasons.",
        };
      }
    } catch (error) {
      console.error("Arcjet protection error:", error);
      // Continue - don't block if Arcjet fails
    }

    // Call the original action
    return action(prevState, formData);
  };
}
```

**Usage:**
```typescript
import { withRateLimit } from "@/lib/with-rate-limit";

export const subscribeToNewsletter = withRateLimit(
  async (prevState: NewsletterState, formData: FormData): Promise<NewsletterState> => {
    // Your original logic here
  },
  {
    tokensRequested: 1,
    errorMessage: "Too many subscription attempts. Please wait."
  }
);
```

---

## ✅ Option 3: Convert to API Routes (Most Secure)

### How It Works
Convert server actions to API routes and use Arcjet like in `/api/arcjet`.

### Implementation

**File: `app/api/newsletter/subscribe/route.ts`**
```typescript
import arcjet, { tokenBucket, shield } from "@arcjet/next";
import { NextResponse } from "next/server";
import { db, subscribers } from "@/lib/db";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  characteristics: ["ip.src"],
  rules: [
    shield({ mode: "LIVE" }),
    tokenBucket({
      mode: "LIVE",
      refillRate: 3,
      interval: 3600,
      capacity: 3,
    }),
  ],
});

export async function POST(req: Request) {
  const decision = await aj.protect(req, { requested: 1 });

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { email, name } = await req.json();

  try {
    await db.insert(subscribers).values({ email, name });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
```

**Frontend:**
```typescript
// Replace server action with fetch
const response = await fetch('/api/newsletter/subscribe', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, name })
});
```

---

## 🎯 Recommendation

**Use Option 1** (Arcjet in Server Actions) because:
1. ✅ Keeps server actions pattern (cleaner code)
2. ✅ Works with React 19 `useActionState`
3. ✅ No need to refactor frontend
4. ✅ IP detection works via Next.js headers

## 📊 Rate Limit Recommendations

| Action | Rate Limit | Reasoning |
|--------|------------|-----------|
| Newsletter Subscription | 3 per hour | Prevents email spam |
| Admin Role Change | 10 per 10 min | Prevents abuse |
| Project Creation | 5 per hour | Admin only, still limit |
| Database Test | 20 per hour | Admin diagnostics |

## 🧪 Testing Rate Limits

```bash
# Test newsletter rate limit (should fail after 3 attempts)
for i in {1..5}; do
  curl -X POST http://localhost:3000 \
    -d "email=test$i@example.com" \
    -d "name=Test"
  sleep 1
done
```

## 🔧 Environment Variables

Add to `.env.local`:
```bash
ARCJET_KEY=ajkey_xxxxxxxxxxxxx
```

## 📝 Next Steps

1. Install dependencies (already have `@arcjet/next`)
2. Create `lib/arcjet-server.ts`
3. Update `app/actions/newsletter.ts`
4. Update `app/actions/admin.ts`
5. Test with rapid requests
6. Update security test script

Would you like me to implement this now?
