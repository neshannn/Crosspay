import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, services as servicesTable, user as userTable, digitalKeys as digitalKeysTable } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pidx = searchParams.get("pidx");
  const status = searchParams.get("status");
  const purchase_order_id = searchParams.get("purchase_order_id");

  if (!pidx || !purchase_order_id) {
    return NextResponse.redirect(new URL("/dashboard?status=error&message=Invalid+payment+response", req.url));
  }

  try {
    // 1. Verify Payment with Khalti Lookup
    const khaltiSecret = "key 496660f6430a471694f2756d11f016d2"; // Test Secret Key
    const response = await fetch("https://a.khalti.com/api/v2/epayment/lookup/", {
      method: "POST",
      headers: {
        "Authorization": khaltiSecret,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pidx }),
    });

    const verifyData = await response.json();

    if (verifyData.status !== "Completed") {
      console.error("Khalti verification failed or not completed:", verifyData);
      return NextResponse.redirect(new URL("/dashboard?status=failure", req.url));
    }

    // 2. Update Order Status
    const orderId = purchase_order_id;
    const order = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    
    if (!order.length) {
      return NextResponse.redirect(new URL("/dashboard?status=error&message=Order+not+found", req.url));
    }

    if (order[0].status === "completed") {
      return NextResponse.redirect(new URL("/dashboard?status=success", req.url));
    }

    // 3. Fulfillment: Get random digital key and consume it
    const randomKey = await db.select()
      .from(digitalKeysTable)
      .where(eq(digitalKeysTable.serviceId, order[0].serviceId))
      .orderBy(sql`RAND()`)
      .limit(1);

    const digitalKeyString = randomKey.length > 0 ? randomKey[0].key : "NO-KEY-AVAILABLE-CONTACT-SUPPORT";

    // Update order to completed
    await db.update(orders)
      .set({ status: "completed" })
      .where(eq(orders.id, orderId));

    // Delete the consumed key
    if (randomKey.length > 0) {
      await db.delete(digitalKeysTable).where(eq(digitalKeysTable.id, randomKey[0].id));
      
      // Update stock
      const countData = await db.select({ count: sql<number>`count(*)` }).from(digitalKeysTable).where(eq(digitalKeysTable.serviceId, order[0].serviceId));
      const count = Number(countData[0].count);
      await db.update(servicesTable).set({ stock: count.toString() }).where(eq(servicesTable.id, order[0].serviceId));
    }

    // 4. Get Service and User Details for Email
    const service = await db.select().from(servicesTable).where(eq(servicesTable.id, order[0].serviceId)).limit(1);
    const user = await db.select().from(userTable).where(eq(userTable.id, order[0].userId)).limit(1);

    if (service.length && user.length) {
      // 5. Send Email (Mocked)
      console.log("-----------------------------------------");
      console.log("KHALTI PAYMENT SUCCESSFUL");
      console.log("EMAIL SENT TO:", user[0].email);
      console.log("SUBJECT: Your Digital Key for " + service[0].name);
      console.log("MESSAGE: Thank you for your purchase! Here is your digital key:");
      console.log("KEY:", digitalKeyString);
      console.log("-----------------------------------------");
    }

    return NextResponse.redirect(new URL("/dashboard?status=success", req.url));
  } catch (error) {
    console.error("Khalti callback error:", error);
    return NextResponse.redirect(new URL("/dashboard?status=error", req.url));
  }
}
