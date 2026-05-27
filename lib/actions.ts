"use server";

import * as z from "zod";
import { auth } from "@/lib/auth";
import { LoginSchema, RegisterSchema } from "@/lib/schemas";
import { redirect } from 'next/navigation';
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { orders, services as servicesTable, digitalKeys as digitalKeysTable } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import crypto from "crypto";

export const addService = async (data: { name: string, price: number, description: string, icon: string, category: string, stock: number }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== 'admin') {
    return { error: "Unauthorized" };
  }

  try {
    await db.insert(servicesTable).values({
      id: crypto.randomUUID(),
      ...data,
      price: data.price.toString(),
      stock: data.stock.toString(),
      active: true,
    });
    revalidatePath("/admin/dashboard");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Add service error:", error);
    return { error: "Failed to add service" };
  }
};

export const updateService = async (id: string, data: { name: string, price: number, description: string, icon: string, category: string, stock: number }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== 'admin') {
    return { error: "Unauthorized" };
  }

  try {
    await db.update(servicesTable)
      .set({
        ...data,
        price: data.price.toString(),
        stock: data.stock.toString(),
      })
      .where(eq(servicesTable.id, id));
    
    revalidatePath("/admin/dashboard");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Update service error:", error);
    return { error: "Failed to update service" };
  }
};

export const addDigitalKey = async (serviceId: string, key: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== 'admin') {
    return { error: "Unauthorized" };
  }

  console.log(`Adding digital key for service ${serviceId}: ${key}`);

  try {
    await db.insert(digitalKeysTable).values({
      id: crypto.randomUUID(),
      serviceId,
      key,
      createdAt: new Date(),
    });
    
    // Update stock automatically based on available keys
    const countResult = await db.select({ count: sql<number>`count(*)` }).from(digitalKeysTable).where(eq(digitalKeysTable.serviceId, serviceId));
    const newStock = countResult[0]?.count || 0;
    
    console.log(`Updated key count for ${serviceId}: ${newStock}`);

    await db.update(servicesTable).set({ stock: newStock.toString() }).where(eq(servicesTable.id, serviceId));

    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Add digital key error:", error);
    return { error: `Failed to add key: ${error instanceof Error ? error.message : "Unknown error"}` };
  }
};

export const getDigitalKeys = async (serviceId: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== 'admin') {
    return { error: "Unauthorized" };
  }

  try {
    console.log(`Fetching keys for service: ${serviceId}`);
    const keys = await db.select().from(digitalKeysTable).where(eq(digitalKeysTable.serviceId, serviceId));
    console.log(`Found ${keys.length} keys`);
    return { success: true, keys };
  } catch (error) {
    console.error("Fetch keys error:", error);
    return { error: `Failed to fetch keys: ${error instanceof Error ? error.message : "Unknown error"}` };
  }
};

export const deleteDigitalKey = async (id: string, serviceId: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== 'admin') {
    return { error: "Unauthorized" };
  }

  try {
    console.log(`Deleting key ${id} for service ${serviceId}`);
    await db.delete(digitalKeysTable).where(eq(digitalKeysTable.id, id));
    
    // Update stock
    const countResult = await db.select({ count: sql<number>`count(*)` }).from(digitalKeysTable).where(eq(digitalKeysTable.serviceId, serviceId));
    const newStock = countResult[0]?.count || 0;
    
    await db.update(servicesTable).set({ stock: newStock.toString() }).where(eq(servicesTable.id, serviceId));

    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Delete key error:", error);
    return { error: `Failed to delete key: ${error instanceof Error ? error.message : "Unknown error"}` };
  }
};


export const deleteService = async (id: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== 'admin') {
    return { error: "Unauthorized" };
  }

  try {
    // Note: This might fail if there are orders referencing this service
    // In a real app, you'd probably just deactivate it
    await db.delete(servicesTable).where(eq(servicesTable.id, id));
    revalidatePath("/admin/dashboard");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Delete service error:", error);
    return { error: "Failed to delete service. It might be referenced by existing orders." };
  }
};

export const login = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password } = validatedFields.data;

  try {
    const res = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
      headers: await headers(),
    });

    if (!res) {
      return { error: "Invalid credentials!" };
    }

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (session?.user.role === 'admin') {
        revalidatePath("/admin/dashboard");
        redirect("/admin/dashboard");
    }

    revalidatePath("/dashboard");
    redirect("/dashboard");
  } catch (error: any) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
        throw error;
    }
    if (error.status === 401 || error.status === 400) {
      return { error: "Invalid credentials!" };
    }
    return { error: "Something went wrong!" };
  }
};

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password, name, role } = validatedFields.data;

  try {
    const res = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
        // @ts-ignore - Better Auth might not have role in types yet but it works via additionalFields
        role,
      },
      headers: await headers(),
    });

    if (!res) {
      return { error: "Failed to create account!" };
    }
    
    if (role === 'admin') {
        revalidatePath("/admin/dashboard");
        redirect("/admin/dashboard");
    }

    revalidatePath("/", "layout");
    redirect("/dashboard");
  } catch (error: any) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
        throw error;
    }
    console.error("Registration error:", error);
    if (error.status === 400 && error.message?.includes("already exists")) {
        return { error: "User already exists!" };
    }
    return { error: "Something went wrong!" };
  }
};

export const logout = async () => {
  await auth.api.signOut({
    headers: await headers(),
  });
  revalidatePath("/", "layout");
  redirect('/login');
};

export const createOrder = async (serviceId: string, amount: number, quantity: number, paymentMethod: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: "You must be logged in to make an order." };
  }

  // Check stock availability
  const service = await db.select().from(servicesTable).where(eq(servicesTable.id, serviceId)).limit(1);
  if (!service.length) return { error: "Service not found" };
  
  const currentStock = Number(service[0].stock ?? 0);
  if (currentStock < quantity) {
    return { error: "Out of stock! Only " + currentStock + " items remaining." };
  }

  const totalAmount = amount * quantity;

  try {
    const orderId = crypto.randomUUID();
    
    // Create the order and decrement stock
    try {
      await db.transaction(async (tx) => {
        await tx.insert(orders).values({
          id: orderId,
          userId: session.user.id,
          serviceId: serviceId,
          amount: totalAmount.toString(),
          status: "awaiting_payment",
          paymentMethod: paymentMethod,
          createdAt: new Date(),
        });

        // Decrement stock
        await tx.update(servicesTable)
          .set({ stock: (currentStock - quantity).toString() })
          .where(eq(servicesTable.id, serviceId));
      });
    } catch (dbError) {
      console.error("Database error (likely schema mismatch):", dbError);
    }

    if (paymentMethod === 'eSewa') {
      const secretKey = "8gBm/:&EnhH.1/q"; // eSewa Test Secret Key
      const productCode = "EPAYTEST";
      const dataToSign = `total_amount=${totalAmount},transaction_uuid=${orderId},product_code=${productCode}`;
      
      const signature = crypto
        .createHmac("sha256", secretKey)
        .update(dataToSign)
        .digest("base64");

      return { 
        success: true, 
        paymentUrl: "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
        paymentParams: {
          amount: totalAmount,
          tax_amount: 0,
          total_amount: totalAmount,
          transaction_uuid: orderId,
          product_code: productCode,
          product_service_charge: 0,
          product_delivery_charge: 0,
          success_url: `${process.env.BETTER_AUTH_URL}/api/payment/esewa/callback`,
          failure_url: `${process.env.BETTER_AUTH_URL}/dashboard?status=failure`,
          signed_field_names: "total_amount,transaction_uuid,product_code",
          signature: signature
        }
      };
    }

    if (paymentMethod === 'Khalti') {
      try {
        const khaltiSecret = "key 496660f6430a471694f2756d11f016d2"; // Test Secret Key
        const response = await fetch("https://a.khalti.com/api/v2/epayment/initiate/", {
          method: "POST",
          headers: {
            "Authorization": khaltiSecret,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            return_url: `${process.env.BETTER_AUTH_URL}/api/payment/khalti/callback`,
            website_url: process.env.BETTER_AUTH_URL,
            amount: totalAmount * 100, // Paisa
            purchase_order_id: orderId,
            purchase_order_name: service[0].name,
            customer_info: {
              name: session.user.name || "Customer",
              email: session.user.email,
              phone: "9800000000",
            },
          }),
        });

        const khaltiData = await response.json();

        if (khaltiData.payment_url) {
          return {
            success: true,
            paymentUrl: khaltiData.payment_url,
          };
        } else {
          console.error("Khalti init error:", khaltiData);
          return { error: "Failed to initialize Khalti payment" };
        }
      } catch (err) {
        console.error("Khalti fetch error:", err);
        return { error: "Khalti payment service unavailable" };
      }
    }

    revalidatePath("/dashboard");
    return { success: true, message: "Order placed successfully!" };
  } catch (error) {
    console.error("Order creation error:", error);
    return { error: "Failed to create order. Please try again." };
  }
};

export const getEsewaPaymentParams = async (orderId: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: "Unauthorized" };
  }

  try {
    const order = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    
    if (!order.length) {
      return { error: "Order not found" };
    }

    if (order[0].userId !== session.user.id) {
      return { error: "Unauthorized" };
    }

    const totalAmount = Number(order[0].amount);
    const secretKey = "8gBm/:&EnhH.1/q"; // eSewa Test Secret Key
    const productCode = "EPAYTEST";
    const dataToSign = `total_amount=${totalAmount},transaction_uuid=${orderId},product_code=${productCode}`;
    
    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(dataToSign)
      .digest("base64");

    return { 
      success: true, 
      paymentUrl: "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
      paymentParams: {
        amount: totalAmount,
        tax_amount: 0,
        total_amount: totalAmount,
        transaction_uuid: orderId,
        product_code: productCode,
        product_service_charge: 0,
        product_delivery_charge: 0,
        success_url: `${process.env.BETTER_AUTH_URL}/api/payment/esewa/callback`,
        failure_url: `${process.env.BETTER_AUTH_URL}/dashboard?status=failure`,
        signed_field_names: "total_amount,transaction_uuid,product_code",
        signature: signature
      }
    };
  } catch (error) {
    console.error("Payment params error:", error);
    return { error: "Failed to generate payment parameters" };
  }
};

export const getKhaltiPaymentUrl = async (orderId: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: "Unauthorized" };
  }

  try {
    const order = await db.select({
      id: orders.id,
      amount: orders.amount,
      serviceName: servicesTable.name,
      userId: orders.userId
    })
    .from(orders)
    .leftJoin(servicesTable, eq(orders.serviceId, servicesTable.id))
    .where(eq(orders.id, orderId))
    .limit(1);
    
    if (!order.length) {
      return { error: "Order not found" };
    }

    if (order[0].userId !== session.user.id) {
      return { error: "Unauthorized" };
    }

    const totalAmount = Number(order[0].amount);
    const khaltiSecret = "key 496660f6430a471694f2756d11f016d2"; // Test Secret Key
    
    const response = await fetch("https://a.khalti.com/api/v2/epayment/initiate/", {
      method: "POST",
      headers: {
        "Authorization": khaltiSecret,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        return_url: `${process.env.BETTER_AUTH_URL}/api/payment/khalti/callback`,
        website_url: process.env.BETTER_AUTH_URL,
        amount: totalAmount * 100, // Paisa
        purchase_order_id: orderId,
        purchase_order_name: order[0].serviceName || "Subscription",
        customer_info: {
          name: session.user.name || "Customer",
          email: session.user.email,
          phone: "9800000000",
        },
      }),
    });

    const khaltiData = await response.json();

    if (khaltiData.payment_url) {
      return {
        success: true,
        paymentUrl: khaltiData.payment_url,
      };
    } else {
      return { error: "Failed to initialize Khalti payment" };
    }
  } catch (error) {
    console.error("Khalti params error:", error);
    return { error: "Failed to generate payment parameters" };
  }
};
