import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { adminUpdateOrderStatus } from "@/features/admin/actions/order-actions"
import { OrderStatus } from "@prisma/client"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function AdminOrdersPage() {
  const session = await auth()
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/")
  }

  const orders = await prisma.order.findMany({
    include: { store: true, user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" }
  })

  const availableStatuses: OrderStatus[] = [
    "PENDING_PAYMENT", "PAID", "PACKED", "SHIPPED", 
    "DELIVERED", "COMPLETED", "CANCELLED", 
    "REFUND_REQUESTED", "REFUND_APPROVED", "REFUND_REJECTED", "RETURNED"
  ]

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div>
        <h1 className="text-3xl font-heading font-bold">Global Orders</h1>
        <p className="text-muted-foreground mt-1">Platform-wide order oversight and refund management.</p>
      </div>

      <div className="bg-card rounded-2xl border border-border/40 overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground border-b border-border/40">
            <tr>
              <th className="px-6 py-4 font-medium">Order No.</th>
              <th className="px-6 py-4 font-medium">Customer</th>
              <th className="px-6 py-4 font-medium">Store</th>
              <th className="px-6 py-4 font-medium">Amount</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 font-medium">{order.orderNumber}</td>
                <td className="px-6 py-4">{order.user.name || order.user.email}</td>
                <td className="px-6 py-4">{order.store.name}</td>
                <td className="px-6 py-4">${order.totalAmount.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <form action={async (formData: FormData) => {
                    "use server"
                    const status = formData.get("status") as OrderStatus
                    await adminUpdateOrderStatus(order.id, status)
                  }} className="flex items-center justify-end gap-2">
                    <select name="status" defaultValue={order.status} className="h-8 rounded-lg border border-input bg-background px-2 text-xs">
                      {availableStatuses.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <Button variant="outline" size="sm" type="submit" className="rounded-xl text-xs h-8">
                      Apply
                    </Button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
