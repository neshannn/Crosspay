import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, services as servicesTable, user as userTable, digitalKeys as digitalKeysTable } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import crypto from "crypto";

import { processFulfillment } from "@/lib/fulfillment";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dataStr = searchParams.get("data");

  if (!dataStr) {
    return NextResponse.redirect(new URL("/dashboard?status=error&message=No+data+received", req.url));
  }

  try {
    // 1. Decode the data
    const decodedData = JSON.parse(Buffer.from(dataStr, "base64").toString("utf-8"));
    const { status, signature, signed_field_names, transaction_uuid, transaction_code } = decodedData;

    // 2. Verify Signature
    const secretKey = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";
    
    // Dynamically build data to sign based on signed_field_names from response
    const fieldNames = signed_field_names.split(',');
    const dataToSign = fieldNames
      .map((field: string) => `${field}=${decodedData[field]}`)
      .join(',');
    
    const expectedSignature = crypto
      .createHmac("sha256", secretKey)
      .update(dataToSign)
      .digest("base64");

    if (expectedSignature !== signature) {
      console.error("Signature mismatch!", { 
        expectedSignature, 
        signature, 
        dataToSign,
        decodedData 
      });
      return NextResponse.redirect(new URL("/dashboard?status=error&message=Signature+verification+failed", req.url));
    }

    if (status !== "COMPLETE") {
      console.log("Payment status not complete:", status);
      // Extract original orderId (removing timestamp suffix)
      const orderId = transaction_uuid.split('-').length > 5 
        ? transaction_uuid.split('-').slice(0, 5).join('-') 
        : transaction_uuid;

      // Update order status if failed
      if (status === "CANCELED" || status === "AMBIGUOUS") {
        await db.update(orders)
          .set({ status: "failed", transactionId: transaction_code })
          .where(eq(orders.id, orderId));
      }
      return NextResponse.redirect(new URL("/dashboard?status=failure", req.url));
    }

    // 3. Fulfillment
    const orderId = transaction_uuid.split('-').length > 5 
      ? transaction_uuid.split('-').slice(0, 5).join('-') 
      : transaction_uuid;

    await processFulfillment(orderId, transaction_code);

    return NextResponse.redirect(new URL("/dashboard?status=success", req.url));
  } catch (error) {
    console.error("Callback error:", error);
    return NextResponse.redirect(new URL("/dashboard?status=error", req.url));
  }
}

