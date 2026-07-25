import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { OrderStatus } from "@prisma/client"
import { updateOrderStatus } from "@/features/seller/actions/order-actions"

export const dynamic = "force-dynamic"

export default async function SellerOrdersPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/")

  const store = await prisma.store.findFirst({
    where: { userId: session.user.id }
  })

  if (!store) redirect("/")

  const orders = await prisma.order.findMany({
    where: { storeId: store.id },
    include: {
      items: { include: { variant: { include: { product: true } } } },
      shippingAddress: true,
      user: { select: { name: true, email: true } }
    },
    orderBy: { createdAt: "desc" }
  })

  const availableStatuses: OrderStatus[] = ["PAID", "PACKED", "SHIPPED", "DELIVERED", "COMPLETED", "CANCELLED"]

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div>
        <h1 className="text-3xl font-heading font-bold">Orders</h1>
        <p className="text-muted-foreground mt-1">Manage and fulfill your customer orders.</p>
      </div>

      <div className="bg-card rounded-2xl border border-border/40 overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground border-b border-border/40">
            <tr>
              <th className="px-6 py-4 font-medium">Order No.</th>
              <th className="px-6 py-4 font-medium">Customer</th>
              <th className="px-6 py-4 font-medium">Amount</th>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map(order => (
                <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-medium">{order.orderNumber}</td>
                  <td className="px-6 py-4">{order.user.name || order.user.email}</td>
                  <td className="px-6 py-4">${order.totalAmount.toFixed(2)}</td>
                  <td className="px-6 py-4">{order.createdAt.toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <form action={async (formData: FormData) => {
                      "use server"
                      const status = formData.get("status") as OrderStatus
                      await updateOrderStatus(order.id, status)
                    }} className="flex items-center justify-end gap-2">
                      <select name="status" defaultValue={order.status} className="h-8 rounded-lg border border-input bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        {availableStatuses.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <button type="submit" className="h-8 px-3 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs font-medium transition-colors">
                        Update
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
