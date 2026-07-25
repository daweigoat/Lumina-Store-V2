import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  const session = await auth()
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/")
  }

  const [usersCount, sellersCount, ordersCount, totalRevenueResult] = await Promise.all([
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.user.count({ where: { role: "SELLER" } }),
    prisma.order.count(),
    prisma.order.aggregate({
      where: { status: { in: ["PAID", "PACKED", "SHIPPED", "DELIVERED", "COMPLETED"] } },
      _sum: { totalAmount: true }
    })
  ])

  const totalRevenue = totalRevenueResult._sum.totalAmount || 0

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div>
        <h1 className="text-3xl font-heading font-bold">Platform Overview</h1>
        <p className="text-muted-foreground mt-1">Global statistics and analytics for LuminaStore.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="bg-card rounded-2xl border border-border/40 p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Revenue</h3>
          <div className="text-3xl font-bold">${totalRevenue.toFixed(2)}</div>
        </div>
        <div className="bg-card rounded-2xl border border-border/40 p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Orders</h3>
          <div className="text-3xl font-bold">{ordersCount}</div>
        </div>
        <div className="bg-card rounded-2xl border border-border/40 p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Customers</h3>
          <div className="text-3xl font-bold">{usersCount}</div>
        </div>
        <div className="bg-card rounded-2xl border border-border/40 p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Sellers</h3>
          <div className="text-3xl font-bold">{sellersCount}</div>
        </div>
      </div>
    </div>
  )
}
