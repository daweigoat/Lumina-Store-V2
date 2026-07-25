import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function SellerDashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/")

  const store = await prisma.store.findFirst({
    where: { userId: session.user.id }
  })

  if (!store) redirect("/")

  const [totalSalesResult, orderCounts] = await Promise.all([
    prisma.order.aggregate({
      where: { storeId: store.id, status: { in: ["PAID", "PACKED", "SHIPPED", "DELIVERED", "COMPLETED"] } },
      _sum: { totalAmount: true }
    }),
    prisma.order.groupBy({
      by: ['status'],
      where: { storeId: store.id },
      _count: true
    })
  ])

  const totalSales = totalSalesResult._sum.totalAmount || 0
  let totalOrders = 0
  let pendingOrders = 0

  orderCounts.forEach(c => {
    totalOrders += c._count
    if (c.status === "PENDING_PAYMENT" || c.status === "PAID") {
      pendingOrders += c._count
    }
  })

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div>
        <h1 className="text-3xl font-heading font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your store&apos;s performance.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-card rounded-2xl border border-border/40 p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Sales</h3>
          <div className="text-3xl font-bold">${totalSales.toFixed(2)}</div>
        </div>
        <div className="bg-card rounded-2xl border border-border/40 p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Orders</h3>
          <div className="text-3xl font-bold">{totalOrders}</div>
        </div>
        <div className="bg-card rounded-2xl border border-border/40 p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Orders to Fulfill</h3>
          <div className="text-3xl font-bold text-amber-500">{pendingOrders}</div>
        </div>
      </div>
    </div>
  )
}
