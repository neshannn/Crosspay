import { db } from "@/lib/db";
import { orders, services as servicesTable, user as userTable, digitalKeys as digitalKeysTable, orderItems } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { sendFulfillmentEmail } from "./mail";

export async function processFulfillment(orderId: string, transactionId: string) {
  const order = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  
  if (!order.length) {
    throw new Error("Order not found");
  }

  if (order[0].status === "completed") {
    return;
  }

  // Update order to completed and save transaction reference
  await db.update(orders)
    .set({ 
      status: "completed",
      transactionId: transactionId 
    })
    .where(eq(orders.id, orderId));

  // Fulfillment: Get digital keys for all items
  const itemsToProcess = [];
  if (order[0].serviceId) {
    itemsToProcess.push({ serviceId: order[0].serviceId, quantity: 1 });
  } else {
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
    for (const item of items) {
      itemsToProcess.push({ serviceId: item.serviceId, quantity: item.quantity });
    }
  }

  const fulfillmentDetails = [];

  for (const item of itemsToProcess) {
    const keys = await db.select()
      .from(digitalKeysTable)
      .where(eq(digitalKeysTable.serviceId, item.serviceId))
      .orderBy(sql`RAND()`)
      .limit(item.quantity);

    const service = await db.select().from(servicesTable).where(eq(servicesTable.id, item.serviceId)).limit(1);
    const serviceName = service.length ? service[0].name : "Unknown Service";

    const keyStrings = keys.map(k => k.key);
    if (keyStrings.length < item.quantity) {
      for (let i = keyStrings.length; i < item.quantity; i++) {
        keyStrings.push("PENDING-KEY-SUPPORT-NOTIFIED");
      }
    }

    fulfillmentDetails.push({ serviceName, keys: keyStrings });

    // Delete consumed keys
    for (const key of keys) {
      await db.delete(digitalKeysTable).where(eq(digitalKeysTable.id, key.id));
    }

    // Update stock
    const countData = await db.select({ count: sql<number>`count(*)` }).from(digitalKeysTable).where(eq(digitalKeysTable.serviceId, item.serviceId));
    await db.update(servicesTable).set({ stock: Number(countData[0].count) }).where(eq(servicesTable.id, item.serviceId));
  }

  // Send Email (Real)
  const user = await db.select().from(userTable).where(eq(userTable.id, order[0].userId)).limit(1);

  if (user.length) {
    await sendFulfillmentEmail({
      to: user[0].email,
      userName: user[0].name || "Valued Customer",
      orderId: order[0].id,
      totalAmount: order[0].amount,
      fulfillmentDetails: fulfillmentDetails,
    });
  }
}
