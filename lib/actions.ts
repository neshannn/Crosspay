"use server";

import * as z from "zod";
import { auth } from "@/lib/auth";
import { LoginSchema, RegisterSchema } from "@/lib/schemas";
import { redirect } from 'next/navigation';
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { orders, services as servicesTable, digitalKeys as digitalKeysTable, cartItems, orderItems } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import crypto from "crypto";

import { stripe } from "@/lib/stripe";

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

    await db.update(servicesTable).set({ stock: newStock }).where(eq(servicesTable.id, serviceId));

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
    
    await db.update(servicesTable).set({ stock: newStock }).where(eq(servicesTable.id, serviceId));

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

export const checkoutCart = async (paymentMethod: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: "You must be logged in to checkout." };
  }

  try {
    const cartItemsList = await db.select({
      id: cartItems.id,
      quantity: cartItems.quantity,
      serviceId: cartItems.serviceId,
      price: servicesTable.price,
      stock: servicesTable.stock,
      serviceName: servicesTable.name,
    })
    .from(cartItems)
    .innerJoin(servicesTable, eq(cartItems.serviceId, servicesTable.id))
    .where(eq(cartItems.userId, session.user.id));

    if (cartItemsList.length === 0) {
      return { error: "Your cart is empty." };
    }

    // Check stock for all items
    for (const item of cartItemsList) {
      if (Number(item.stock ?? 0) < item.quantity) {
        return { error: `Insufficient stock for ${item.serviceName}. Only ${item.stock} remaining.` };
      }
    }

    const totalAmount = cartItemsList.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);
    const orderId = crypto.randomUUID();

    await db.transaction(async (tx) => {
      // Create the main order
      await tx.insert(orders).values({
        id: orderId,
        userId: session.user.id,
        amount: totalAmount.toString(),
        status: "awaiting_payment",
        paymentMethod: paymentMethod,
        createdAt: new Date(),
      });

      // Create order items and update stock
      for (const item of cartItemsList) {
        await tx.insert(orderItems).values({
          id: crypto.randomUUID(),
          orderId: orderId,
          serviceId: item.serviceId,
          quantity: item.quantity,
          priceAtTime: item.price,
        });

        await tx.update(servicesTable)
          .set({ stock: Number(item.stock ?? 0) - item.quantity })
          .where(eq(servicesTable.id, item.serviceId));
      }

      // Clear the cart
      await tx.delete(cartItems).where(eq(cartItems.userId, session.user.id));
    });

    if (paymentMethod === 'eSewa') {
      const secretKey = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";
      const productCode = process.env.ESEWA_PRODUCT_CODE || "EPAYTEST";
      const esewaUrl = process.env.ESEWA_GATEWAY_URL || "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
      
      const amountStr = totalAmount.toString();
      const transactionUuid = `${orderId}-${Date.now()}`;
      const dataToSign = `total_amount=${amountStr},transaction_uuid=${transactionUuid},product_code=${productCode}`;
      
      const signature = crypto
        .createHmac("sha256", secretKey)
        .update(dataToSign)
        .digest("base64");

      return { 
        success: true, 
        paymentUrl: esewaUrl,
        paymentParams: {
          amount: totalAmount,
          tax_amount: 0,
          total_amount: totalAmount,
          transaction_uuid: transactionUuid,
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

    if (paymentMethod === 'Stripe') {
      const checkoutSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: cartItemsList.map(item => ({
          price_data: {
            currency: 'npr',
            product_data: {
              name: item.serviceName,
            },
            unit_amount: Number(item.price) * 100,
          },
          quantity: item.quantity,
        })),
        mode: 'payment',
        success_url: `${process.env.BETTER_AUTH_URL}/api/payment/stripe/callback?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.BETTER_AUTH_URL}/dashboard?status=failure`,
        metadata: {
          orderId: orderId,
          userId: session.user.id,
        },
      });

      return {
        success: true,
        paymentUrl: checkoutSession.url,
      };
    }

    revalidatePath("/dashboard");
    return { success: true, message: "Order placed successfully!" };
  } catch (error) {
    console.error("Checkout error:", error);
    return { error: "Failed to process checkout. Please try again." };
  }
};

export const getStripeCheckoutUrl = async (orderId: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: "Unauthorized" };
  }

  try {
    const order = await db.select({
      id: ordersTable.id,
      amount: ordersTable.amount,
      userId: ordersTable.userId,
      serviceId: ordersTable.serviceId,
      serviceName: servicesTable.name,
    })
    .from(ordersTable)
    .leftJoin(servicesTable, eq(ordersTable.serviceId, servicesTable.id))
    .where(eq(ordersTable.id, orderId))
    .limit(1);
    
    if (!order.length) {
      return { error: "Order not found" };
    }

    if (order[0].userId !== session.user.id) {
      return { error: "Unauthorized" };
    }

    let line_items = [];
    if (order[0].serviceId) {
      line_items = [
        {
          price_data: {
            currency: 'npr',
            product_data: {
              name: order[0].serviceName || 'Digital Subscription',
            },
            unit_amount: Number(order[0].amount) * 100,
          },
          quantity: 1,
        },
      ];
    } else {
      const items = await db.select({
        name: servicesTable.name,
        price: orderItems.priceAtTime,
        quantity: orderItems.quantity,
      })
      .from(orderItems)
      .innerJoin(servicesTable, eq(orderItems.serviceId, servicesTable.id))
      .where(eq(orderItems.orderId, orderId));

      line_items = items.map(item => ({
        price_data: {
          currency: 'npr',
          product_data: {
            name: item.name,
          },
          unit_amount: Number(item.price) * 100,
        },
        quantity: item.quantity,
      }));
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${process.env.BETTER_AUTH_URL}/api/payment/stripe/callback?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BETTER_AUTH_URL}/dashboard?status=failure`,
      metadata: {
        orderId: orderId,
        userId: session.user.id,
      },
    });

    return { 
      success: true, 
      paymentUrl: checkoutSession.url 
    };
  } catch (error) {
    console.error("Stripe URL error:", error);
    return { error: "Failed to generate Stripe checkout URL" };
  }
};

export const cancelOrder = async (orderId: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: "Unauthorized" };
  }

  try {
    const order = await db.select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order.length) {
      return { error: "Order not found" };
    }

    if (order[0].userId !== session.user.id) {
      return { error: "Unauthorized" };
    }

    // Only allow cancelling pending/awaiting_payment orders
    if (order[0].status !== 'pending' && order[0].status !== 'awaiting_payment') {
      return { error: "Only pending orders can be cancelled." };
    }

    await db.transaction(async (tx) => {
      // 1. Update order status
      await tx.update(orders)
        .set({ status: 'cancelled' })
        .where(eq(orders.id, orderId));

      // 2. Revert stock
      // Get all items associated with this order
      const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, orderId));
      
      if (items.length > 0) {
        for (const item of items) {
          await tx.update(servicesTable)
            .set({ stock: sql`${servicesTable.stock} + ${item.quantity}` })
            .where(eq(servicesTable.id, item.serviceId));
        }
      } else if (order[0].serviceId) {
        // Fallback for legacy single-item orders that didn't use order_items
        // We assume quantity 1 for these as the previous UI didn't have multi-quantity
        await tx.update(servicesTable)
          .set({ stock: sql`${servicesTable.stock} + 1` })
          .where(eq(servicesTable.id, order[0].serviceId));
      }
    });

    revalidatePath("/dashboard");
    return { success: true, message: "Order cancelled successfully!" };
  } catch (error) {
    console.error("Cancel order error:", error);
    return { error: "Failed to cancel order. Please try again." };
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

        // Add to order items for consistency
        await tx.insert(orderItems).values({
          id: crypto.randomUUID(),
          orderId: orderId,
          serviceId: serviceId,
          quantity: quantity,
          priceAtTime: service[0].price,
        });

        // Decrement stock
        await tx.update(servicesTable)
          .set({ stock: currentStock - quantity })
          .where(eq(servicesTable.id, serviceId));
      });
    } catch (dbError) {
      console.error("Database error (likely schema mismatch):", dbError);
    }

    if (paymentMethod === 'eSewa') {
      const secretKey = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";
      const productCode = process.env.ESEWA_PRODUCT_CODE || "EPAYTEST";
      const esewaUrl = process.env.ESEWA_GATEWAY_URL || "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
      
      // Ensure totalAmount is formatted as string to avoid rounding/precision issues in signature
      const amountStr = totalAmount.toString();
      const transactionUuid = `${orderId}-${Date.now()}`;
      const dataToSign = `total_amount=${amountStr},transaction_uuid=${transactionUuid},product_code=${productCode}`;
      
      const signature = crypto
        .createHmac("sha256", secretKey)
        .update(dataToSign)
        .digest("base64");

      return { 
        success: true, 
        paymentUrl: esewaUrl,
        paymentParams: {
          amount: totalAmount,
          tax_amount: 0,
          total_amount: totalAmount,
          transaction_uuid: transactionUuid,
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

    if (paymentMethod === 'Stripe') {
      const checkoutSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'npr',
              product_data: {
                name: service[0].name,
                description: service[0].description || undefined,
              },
              unit_amount: amount * 100, // Stripe expects amount in cents
            },
            quantity: quantity,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.BETTER_AUTH_URL}/api/payment/stripe/callback?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.BETTER_AUTH_URL}/dashboard?status=failure`,
        metadata: {
          orderId: orderId,
          userId: session.user.id,
        },
      });

      return {
        success: true,
        paymentUrl: checkoutSession.url,
      };
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
    const secretKey = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";
    const productCode = process.env.ESEWA_PRODUCT_CODE || "EPAYTEST";
    const esewaUrl = process.env.ESEWA_GATEWAY_URL || "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
    
    // Ensure totalAmount is formatted as string to avoid rounding/precision issues in signature
    const amountStr = totalAmount.toString();
    const transactionUuid = `${orderId}-${Date.now()}`;
    const dataToSign = `total_amount=${amountStr},transaction_uuid=${transactionUuid},product_code=${productCode}`;
    
    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(dataToSign)
      .digest("base64");

    return { 
      success: true, 
      paymentUrl: esewaUrl,
      paymentParams: {
        amount: totalAmount,
        tax_amount: 0,
        total_amount: totalAmount,
        transaction_uuid: transactionUuid,
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

