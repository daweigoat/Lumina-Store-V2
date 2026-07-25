"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

const ToggleWishlistSchema = z.object({
  productId: z.string().min(1)
})

export async function getWishlist() {
  const session = await auth()
  if (!session?.user?.id) return null

  return await prisma.wishlist.findUnique({
    where: { userId: session.user.id },
    include: {
      products: {
        include: {
          brand: true,
          category: true,
          variants: true,
        }
      }
    }
  })
}

export async function toggleWishlistItem(rawProductId: string) {
  const parsed = ToggleWishlistSchema.safeParse({ productId: rawProductId })
  if (!parsed.success) throw new Error("Invalid product ID")

  const { productId } = parsed.data

  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("You must be logged in to manage your wishlist")
  }

  // Get or create wishlist
  let wishlist = await prisma.wishlist.findUnique({
    where: { userId: session.user.id },
    include: { products: true }
  })

  if (!wishlist) {
    wishlist = await prisma.wishlist.create({
      data: { userId: session.user.id },
      include: { products: true }
    })
  }

  const isProductInWishlist = wishlist.products.some(p => p.id === productId)

  if (isProductInWishlist) {
    // Remove
    await prisma.wishlist.update({
      where: { id: wishlist.id },
      data: {
        products: {
          disconnect: { id: productId }
        }
      }
    })
  } else {
    // Add
    await prisma.wishlist.update({
      where: { id: wishlist.id },
      data: {
        products: {
          connect: { id: productId }
        }
      }
    })
  }

  revalidatePath("/")
  revalidatePath("/wishlist")
  revalidatePath(`/product/${productId}`) // Simplified since we might not have the slug here
}
