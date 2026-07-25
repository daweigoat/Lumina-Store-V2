import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        brand: true,
        variants: true,
        store: {
          select: { name: true, logo: true, description: true }
        },
        reviews: {
          include: {
            user: { select: { name: true, image: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}

export async function PUT() {
  return NextResponse.json({ message: "Not implemented" }, { status: 501 })
}

export async function DELETE() {
  return NextResponse.json({ message: "Not implemented" }, { status: 501 })
}
