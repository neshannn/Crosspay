import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { processFulfillment } from "@/lib/fulfillment";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.redirect(new URL("/dashboard?status=error&message=No+session+id", req.url));
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      const orderId = session.metadata?.orderId;
      const transactionId = session.payment_intent as string || sessionId;

      if (!orderId) {
        return NextResponse.redirect(new URL("/dashboard?status=error&message=Order+ID+missing+in+metadata", req.url));
      }

      await processFulfillment(orderId, transactionId);

      return NextResponse.redirect(new URL("/dashboard?status=success", req.url));
    } else {
      return NextResponse.redirect(new URL("/dashboard?status=failure", req.url));
    }
  } catch (error) {
    console.error("Stripe callback error:", error);
    return NextResponse.redirect(new URL("/dashboard?status=error", req.url));
  }
}
