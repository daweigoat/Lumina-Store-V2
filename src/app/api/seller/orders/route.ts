import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { OrderStatus } from "@prisma/client"

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

    const orders = await prisma.order.findMany({
      where: { storeId: store.id },
      include: {
        items: { include: { variant: { include: { product: true } } } },
        shippingAddress: true,
        user: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(orders)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "SELLER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { orderId, status } = body

    if (!orderId || !status || !(status in OrderStatus)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 })
    }

    const store = await prisma.store.findFirst({
      where: { userId: session.user.id }
    })

    if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 })

    const order = await prisma.order.findFirst({
      where: { id: orderId, storeId: store.id }
    })

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status }
    })

    return NextResponse.json(updatedOrder)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
