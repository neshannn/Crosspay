"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { cartItems, services as servicesTable } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import crypto from "crypto";

export const getCartItems = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return [];

  try {
    const items = await db.select({
      id: cartItems.id,
      quantity: cartItems.quantity,
      service: servicesTable,
    })
    .from(cartItems)
    .innerJoin(servicesTable, eq(cartItems.serviceId, servicesTable.id))
    .where(eq(cartItems.userId, session.user.id));

    return items;
  } catch (error) {
    console.error("Fetch cart error:", error);
    return [];
  }
};

export const addToCart = async (serviceId: string, quantity: number = 1) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return { error: "You must be logged in to add to cart." };

  try {
    // Check if item already exists in cart
    const existing = await db.select()
      .from(cartItems)
      .where(and(
        eq(cartItems.userId, session.user.id),
        eq(cartItems.serviceId, serviceId)
      ))
      .limit(1);

    if (existing.length > 0) {
      // Update quantity
      await db.update(cartItems)
        .set({ quantity: existing[0].quantity + quantity })
        .where(eq(cartItems.id, existing[0].id));
    } else {
      // Insert new item
      await db.insert(cartItems).values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        serviceId,
        quantity,
        createdAt: new Date(),
      });
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Add to cart error:", error);
    return { error: "Failed to add to cart" };
  }
};

export const removeFromCart = async (cartItemId: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return { error: "Unauthorized" };

  try {
    await db.delete(cartItems)
      .where(and(
        eq(cartItems.id, cartItemId),
        eq(cartItems.userId, session.user.id)
      ));

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Remove from cart error:", error);
    return { error: "Failed to remove from cart" };
  }
};

export const updateCartItemQuantity = async (cartItemId: string, quantity: number) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return { error: "Unauthorized" };

  if (quantity <= 0) {
    return removeFromCart(cartItemId);
  }

  try {
    await db.update(cartItems)
      .set({ quantity })
      .where(and(
        eq(cartItems.id, cartItemId),
        eq(cartItems.userId, session.user.id)
      ));

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Update cart error:", error);
    return { error: "Failed to update cart" };
  }
};

export const clearCart = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return { error: "Unauthorized" };

  try {
    await db.delete(cartItems).where(eq(cartItems.userId, session.user.id));
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Clear cart error:", error);
    return { error: "Failed to clear cart" };
  }
};
