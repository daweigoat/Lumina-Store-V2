"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { z } from "zod"
import { revalidatePath } from "next/cache"

const CreateReviewSchema = z.object({
  productId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  images: z.array(z.string()).default([]),
})

export async function createReview(formData: FormData) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      throw new Error("Must be logged in to review")
    }

    const data = {
      productId: formData.get("productId") as string,
      rating: parseInt(formData.get("rating") as string, 10),
      comment: formData.get("comment") as string || undefined,
      images: [] // Stub for image uploads
    }

    const parsed = CreateReviewSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: "Invalid review data" }
    }

    // Verify buyer: User must have an order with status COMPLETED or DELIVERED containing this product
    const orderItems = await prisma.orderItem.findMany({
      where: {
        variant: {
          productId: parsed.data.productId
        },
        order: {
          userId: session.user.id,
          status: { in: ["DELIVERED", "COMPLETED"] }
        }
      }
    })

    if (orderItems.length === 0) {
      return { success: false, error: "Only verified buyers can review this product" }
    }

    // Check if review already exists
    const existing = await prisma.review.findFirst({
      where: {
        userId: session.user.id,
        productId: parsed.data.productId
      }
    })

    if (existing) {
      return { success: false, error: "You have already reviewed this product" }
    }

    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        productId: parsed.data.productId,
        rating: parsed.data.rating,
        comment: parsed.data.comment,
        images: parsed.data.images,
        isVerifiedBuyer: true
      }
    })

    const product = await prisma.product.findUnique({
      where: { id: parsed.data.productId }
    })
    
    if (product) {
      revalidatePath(`/product/${product.slug}`)
    }
    
    return { success: true, reviewId: review.id }
  } catch (error) {
    console.error("Create review error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function replyToReview(reviewId: string, reply: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      throw new Error("Unauthorized")
    }

    // Verify seller owns the product
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { product: true }
    })

    if (!review) throw new Error("Review not found")

    const store = await prisma.store.findFirst({
      where: { id: review.product.storeId, userId: session.user.id }
    })

    if (!store) {
      throw new Error("You do not have permission to reply to this review")
    }

    await prisma.review.update({
      where: { id: reviewId },
      data: { sellerReply: reply }
    })

    revalidatePath(`/product/${review.product.slug}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}
