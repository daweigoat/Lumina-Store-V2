"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { z } from "zod"
import { revalidatePath } from "next/cache"

const ProductSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3),
  description: z.string().min(10),
  price: z.number().min(0),
  categoryId: z.string(),
  inventory: z.number().min(0).default(0),
  images: z.array(z.string()).default([]),
})

const VariantSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  value: z.string(),
  price: z.number().optional(),
  inventory: z.number().min(0).default(0),
})

export async function upsertProduct(formData: FormData) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "SELLER") {
      throw new Error("Unauthorized")
    }

    const store = await prisma.store.findFirst({
      where: { userId: session.user.id }
    })

    if (!store) throw new Error("Store not found")

    // In a real app we'd parse all images and variants from FormData properly
    // This is simplified for demonstration
    const data = {
      id: formData.get("id") as string || undefined,
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: parseFloat(formData.get("price") as string),
      categoryId: formData.get("categoryId") as string,
      inventory: parseInt(formData.get("inventory") as string, 10) || 0,
      images: JSON.parse((formData.get("images") as string) || "[]")
    }

    const parsed = ProductSchema.safeParse(data)
    if (!parsed.success) return { success: false, error: "Invalid product data" }

    if (parsed.data.id) {
      // Update
      const product = await prisma.product.update({
        where: { id: parsed.data.id, storeId: store.id },
        data: {
          name: parsed.data.name,
          description: parsed.data.description,
          price: parsed.data.price,
          categoryId: parsed.data.categoryId,
          inventory: parsed.data.inventory,
          images: parsed.data.images
        }
      })
      revalidatePath("/seller/products")
      return { success: true, product }
    } else {
      // Create
      const baseSlug = parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      const slug = `${baseSlug}-${Date.now()}`

      const product = await prisma.product.create({
        data: {
          name: parsed.data.name,
          slug,
          description: parsed.data.description,
          price: parsed.data.price,
          categoryId: parsed.data.categoryId,
          inventory: parsed.data.inventory,
          images: parsed.data.images,
          storeId: store.id
        }
      })
      revalidatePath("/seller/products")
      return { success: true, product }
    }
  } catch (error) {
    console.error("Product upsert error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function upsertVariant(productId: string, data: unknown) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "SELLER") {
      throw new Error("Unauthorized")
    }

    const parsed = VariantSchema.safeParse(data)
    if (!parsed.success) return { success: false, error: "Invalid variant data" }

    if (parsed.data.id) {
      await prisma.variant.update({
        where: { id: parsed.data.id, productId },
        data: {
          name: parsed.data.name,
          value: parsed.data.value,
          price: parsed.data.price,
          inventory: parsed.data.inventory
        }
      })
    } else {
      await prisma.variant.create({
        data: {
          name: parsed.data.name,
          value: parsed.data.value,
          price: parsed.data.price,
          inventory: parsed.data.inventory,
          productId
        }
      })
    }
    
    revalidatePath(`/seller/products/${productId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}
