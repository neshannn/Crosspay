import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, services as servicesTable, user as userTable, digitalKeys as digitalKeysTable } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dataStr = searchParams.get("data");

  if (!dataStr) {
    return NextResponse.redirect(new URL("/dashboard?status=error&message=No+data+received", req.url));
  }

  try {
    // 1. Decode the data
    const decodedData = JSON.parse(Buffer.from(dataStr, "base64").toString("utf-8"));
    const { status, signature, signed_field_names, transaction_uuid } = decodedData;

    // 2. Verify Signature
    const secretKey = "8gBm/:&EnhH.1/q"; // eSewa Test Secret Key
    
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
      // During testing/bypass mode, we might want to log this but continue if needed
      // However, for security we should usually fail. 
      // The user mentioned "test esewa bypass", so let's log it clearly.
      return NextResponse.redirect(new URL("/dashboard?status=error&message=Signature+verification+failed", req.url));
    }

    if (status !== "COMPLETE") {
      console.log("Payment status not complete:", status);
      return NextResponse.redirect(new URL("/dashboard?status=failure", req.url));
    }

    // 3. Update Order Status
    const order = await db.select().from(orders).where(eq(orders.id, transaction_uuid)).limit(1);
    
    if (!order.length) {
      return NextResponse.redirect(new URL("/dashboard?status=error&message=Order+not+found", req.url));
    }

    if (order[0].status === "completed") {
      return NextResponse.redirect(new URL("/dashboard?status=success", req.url));
    }

    // 4. Fulfillment: Get random digital key and consume it
    const randomKey = await db.select()
      .from(digitalKeysTable)
      .where(eq(digitalKeysTable.serviceId, order[0].serviceId))
      .orderBy(sql`RAND()`)
      .limit(1);

    const digitalKeyString = randomKey.length > 0 ? randomKey[0].key : "NO-KEY-AVAILABLE-CONTACT-SUPPORT";

    // Update order to completed
    await db.update(orders)
      .set({ status: "completed" })
      .where(eq(orders.id, transaction_uuid));

    // Delete the consumed key
    if (randomKey.length > 0) {
      await db.delete(digitalKeysTable).where(eq(digitalKeysTable.id, randomKey[0].id));
      
      // Update stock
      const count = await db.select({ count: sql<number>`count(*)` }).from(digitalKeysTable).where(eq(digitalKeysTable.serviceId, order[0].serviceId));
      await db.update(servicesTable).set({ stock: count[0].count.toString() }).where(eq(servicesTable.id, order[0].serviceId));
    }

    // 5. Get Service and User Details for Email
    const service = await db.select().from(servicesTable).where(eq(servicesTable.id, order[0].serviceId)).limit(1);
    const user = await db.select().from(userTable).where(eq(userTable.id, order[0].userId)).limit(1);

    if (service.length && user.length) {
      // 6. Send Email (Mocked)
      console.log("-----------------------------------------");
      console.log("EMAIL SENT TO:", user[0].email);
      console.log("SUBJECT: Your Digital Key for " + service[0].name);
      console.log("MESSAGE: Thank you for your purchase! Here is your digital key:");
      console.log("KEY:", digitalKeyString);
      console.log("-----------------------------------------");
    }

    return NextResponse.redirect(new URL("/dashboard?status=success", req.url));
  } catch (error) {
    console.error("Callback error:", error);
    return NextResponse.redirect(new URL("/dashboard?status=error", req.url));
  }
}

