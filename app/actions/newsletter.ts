"use server"

import { db, subscribers } from "@/lib/db"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { ActionState, newsletterSubscriptionSchema } from "@/lib/types"
import { isAdmin } from "@/lib/auth"
import { aj, createArcjetRequest, RATE_LIMITS } from "@/lib/arcjet-server"

// Define and export the interface for newsletter state
export interface NewsletterState extends ActionState {
  email?: string;
  name?: string;
}

// Create an async function to return the initial state instead of exporting the object directly
export async function getInitialNewsletterState(): Promise<NewsletterState> {
  return {
    status: "idle",
    message: "",
  };
}

/**
 * Server action to subscribe a user to the newsletter
 * For use with useActionState in React 19
 */
export async function subscribeToNewsletter(
  prevState: NewsletterState,
  formData: FormData
): Promise<NewsletterState> {

  // ✅ ARCJET RATE LIMITING - Protect against spam and abuse
  try {
    const req = await createArcjetRequest();
    const decision = await aj.protect(req, { requested: RATE_LIMITS.NEWSLETTER });

    console.log("Arcjet decision for newsletter:", decision);

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return {
          status: "error",
          message: "Too many subscription attempts. Please try again in a few seconds.",
        };
      }

      if (decision.reason.isBot()) {
        return {
          status: "error",
          message: "Bot detected. If you're human, please try again.",
        };
      }

      return {
        status: "error",
        message: "Request blocked for security reasons. Please try again later.",
      };
    }
  } catch (error) {
    console.error("Arcjet protection error:", error);
    // Continue anyway - don't block legitimate users if Arcjet fails
    // In production, you might want to handle this differently
  }

  // Parse the form data
  const email = formData.get("email") as string
  const name = formData.get("name") as string

  // Validate the input with Zod schema
  const validationResult = newsletterSubscriptionSchema.safeParse({ email, name });
  if (!validationResult.success) {
    return {
      status: "error",
      message: validationResult.error.issues[0]?.message || "Invalid input data",
    }
  }

  try {
    // Check if email already exists
    const existingSubscriber = await db.select().from(subscribers).where(eq(subscribers.email, email))

    if (existingSubscriber.length > 0) {
      // ✅ SECURITY: Use generic success message to prevent email enumeration
      // Don't reveal if email is already in database
      return {
        status: "success",
        message: "Thank you for your interest! If you're not already subscribed, you'll receive updates soon.",
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

/**
 * Server action to get all newsletter subscribers
 * Only accessible by admin users
 */
export async function getSubscribers(): Promise<Array<typeof subscribers.$inferSelect>> {
  try {
    // Check if current user is admin
    const userIsAdmin = await isAdmin()
    if (!userIsAdmin) {
      console.error("Unauthorized attempt to access subscriber list")
      throw new Error("Unauthorized. Admin privileges required")
    }

    const allSubscribers = await db.select().from(subscribers).orderBy(subscribers.createdAt)
    return allSubscribers
  } catch (error) {
    console.error("Error fetching subscribers:", error)
    return []
  }
}
