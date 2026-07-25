import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { z } from "zod"

const CreateProductSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  price: z.number().min(0),
  categoryId: z.string(),
  inventory: z.number().min(0).default(0),
  variants: z.array(z.object({
    name: z.string(),
    value: z.string(),
    price: z.number().optional(),
    inventory: z.number().min(0)
  })).min(1, "At least one variant is required")
})

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "SELLER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const store = await prisma.store.findFirst({
      where: { userId: session.user.id }
    })

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 })
    }

    const body = await request.json()
    const parsed = CreateProductSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data", details: parsed.error.format() }, { status: 400 })
    }

    // Generate unique slug
    const baseSlug = parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
    const slug = `${baseSlug}-${Date.now()}`

    const product = await prisma.product.create({
      data: {
        name: parsed.data.name,
        slug,
        description: parsed.data.description,
        price: parsed.data.price,
        inventory: parsed.data.inventory,
        storeId: store.id,
        categoryId: parsed.data.categoryId,
        variants: {
          create: parsed.data.variants.map(v => ({
            name: v.name,
            value: v.value,
            price: v.price || parsed.data.price,
            inventory: v.inventory
          }))
        }
      },
      include: { variants: true }
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Seller product create error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "SELLER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const store = await prisma.store.findFirst({
      where: { userId: session.user.id }
    })

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 })
    }

    const products = await prisma.product.findMany({
      where: { storeId: store.id },
      include: { variants: true, category: true }
    })

    return NextResponse.json(products)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
