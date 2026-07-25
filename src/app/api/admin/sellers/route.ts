import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const stores = await prisma.store.findMany({
      include: {
        user: { select: { name: true, email: true } },
        _count: { select: { products: true, orders: true } }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(stores)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
