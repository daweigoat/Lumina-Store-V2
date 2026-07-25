"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

const GUEST_CART_COOKIE = "guest_cart_id"

const AddToCartSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
})

const UpdateQuantitySchema = z.object({
  itemId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
})

/**
 * Helper to get the current active Cart (User or Guest)
 */
export async function getCart() {
  const session = await auth()
  const cookieStore = await cookies()
  const guestId = cookieStore.get(GUEST_CART_COOKIE)?.value

  if (session?.user?.id) {
    // Authenticated cart
    let cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            variant: {
              include: { product: true },
            },
          },
          orderBy: { createdAt: 'desc' }
        },
      },
    })
    
    // Create cart if user doesn't have one
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: session.user.id },
        include: {
          items: {
            include: {
              variant: { include: { product: true } }
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      })
    }
    return cart
  } else if (guestId) {
    // Guest cart
    return await prisma.cart.findUnique({
      where: { guestId },
      include: {
        items: {
          include: {
            variant: {
              include: { product: true },
            },
          },
          orderBy: { createdAt: 'desc' }
        },
      },
    })
  }

  return null
}

export async function addToCart(rawVariantId: string, rawQuantity: number) {
  const parsed = AddToCartSchema.safeParse({ variantId: rawVariantId, quantity: rawQuantity })
  if (!parsed.success) {
    throw new Error("Invalid cart data")
  }

  const { variantId, quantity } = parsed.data

  const session = await auth()
  const cookieStore = await cookies()
  let guestId = cookieStore.get(GUEST_CART_COOKIE)?.value

  // Verify variant exists and snapshot price
  const variant = await prisma.variant.findUnique({
    where: { id: variantId },
    include: { product: true }
  })

  if (!variant) throw new Error("Variant not found")
  
  // Price logic: if variant has price, use it; else use product price
  const activePrice = variant.price ?? variant.product.salePrice ?? variant.product.price

  let cart = null

  if (session?.user?.id) {
    cart = await prisma.cart.upsert({
      where: { userId: session.user.id },
      update: {},
      create: { userId: session.user.id },
    })
  } else {
    if (!guestId) {
      guestId = crypto.randomUUID()
      cookieStore.set(GUEST_CART_COOKIE, guestId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      })
    }
    cart = await prisma.cart.upsert({
      where: { guestId },
      update: {},
      create: { guestId },
    })
  }

  if (!cart) throw new Error("Failed to get/create cart")

  // Check if item exists in cart
  const existingItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      variantId: variant.id,
    }
  })

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { 
        quantity: existingItem.quantity + quantity,
        price: activePrice // Update to latest price on addition
      }
    })
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        variantId: variant.id,
        quantity,
        price: activePrice
      }
    })
  }

  revalidatePath("/")
  revalidatePath("/cart")
}

export async function updateCartItemQuantity(rawItemId: string, rawQuantity: number) {
  const parsed = UpdateQuantitySchema.safeParse({ itemId: rawItemId, quantity: rawQuantity })
  if (!parsed.success) throw new Error("Invalid data")

  const { itemId, quantity } = parsed.data

  // Ideally, verify the item belongs to the user's cart
  const cart = await getCart()
  if (!cart) throw new Error("Cart not found")

  const item = cart.items.find(i => i.id === itemId)
  if (!item) throw new Error("Item not found in your cart")

  await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity }
  })

  revalidatePath("/cart")
}

export async function removeFromCart(itemId: string) {
  const cart = await getCart()
  if (!cart) throw new Error("Cart not found")

  const item = cart.items.find(i => i.id === itemId)
  if (!item) throw new Error("Item not found in your cart")

  await prisma.cartItem.delete({
    where: { id: itemId }
  })

  revalidatePath("/cart")
}

export async function clearCart() {
  const cart = await getCart()
  if (!cart) return

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id }
  })

  revalidatePath("/cart")
}

/**
 * Call this upon successful login to merge the guest cart into the user's cart
 */
export async function mergeCart() {
  const session = await auth()
  if (!session?.user?.id) return

  const cookieStore = await cookies()
  const guestId = cookieStore.get(GUEST_CART_COOKIE)?.value
  if (!guestId) return

  const guestCart = await prisma.cart.findUnique({
    where: { guestId },
    include: { items: true }
  })

  if (!guestCart || guestCart.items.length === 0) {
    cookieStore.delete(GUEST_CART_COOKIE)
    return
  }

  // Get or create user cart
  const userCart = await prisma.cart.upsert({
    where: { userId: session.user.id },
    update: {},
    create: { userId: session.user.id },
    include: { items: true }
  })

  // Merge items
  for (const guestItem of guestCart.items) {
    const existingUserItem = userCart.items.find(i => i.variantId === guestItem.variantId)

    if (existingUserItem) {
      await prisma.cartItem.update({
        where: { id: existingUserItem.id },
        data: { quantity: existingUserItem.quantity + guestItem.quantity }
      })
    } else {
      await prisma.cartItem.update({
        where: { id: guestItem.id },
        data: { cartId: userCart.id } // Move the item
      })
    }
  }

  // Delete guest cart and cookie
  await prisma.cart.delete({ where: { id: guestCart.id } })
  cookieStore.delete(GUEST_CART_COOKIE)
}
