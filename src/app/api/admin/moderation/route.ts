import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Stub for moderation content, e.g., reported products or reviews
    const reportedReviews = await prisma.review.findMany({
      where: { rating: 1 }, // Stub condition for flagged reviews
      include: {
        product: { select: { name: true, slug: true } },
        user: { select: { name: true, email: true } }
      },
      take: 20
    })

    return NextResponse.json({ reportedReviews })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const reviewId = searchParams.get("reviewId")
    const productId = searchParams.get("productId")

    if (reviewId) {
      await prisma.review.delete({ where: { id: reviewId } })
      return NextResponse.json({ success: true, message: "Review deleted" })
    }

    if (productId) {
      // Stub for taking down a product
      await prisma.product.delete({ where: { id: productId } })
      return NextResponse.json({ success: true, message: "Product deleted" })
    }

    return NextResponse.json({ error: "No target specified" }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
