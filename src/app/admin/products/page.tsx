import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { updateProductStatus } from "@/features/admin/actions/product-actions"
import { ProductStatus } from "@prisma/client"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function AdminProductsPage() {
  const session = await auth()
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/")
  }

  const products = await prisma.product.findMany({
    include: { store: true, category: true },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div>
        <h1 className="text-3xl font-heading font-bold">Product Moderation</h1>
        <p className="text-muted-foreground mt-1">Review and manage platform products.</p>
      </div>

      <div className="bg-card rounded-2xl border border-border/40 overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground border-b border-border/40">
            <tr>
              <th className="px-6 py-4 font-medium">Product</th>
              <th className="px-6 py-4 font-medium">Store</th>
              <th className="px-6 py-4 font-medium">Price</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {products.map(product => (
              <tr key={product.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 font-medium">
                  {product.name}
                  <div className="text-xs text-muted-foreground font-normal mt-0.5">{product.category.name}</div>
                </td>
                <td className="px-6 py-4">{product.store.name}</td>
                <td className="px-6 py-4">${product.price.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    product.status === "APPROVED" ? "bg-green-500/10 text-green-500" : 
                    product.status === "REJECTED" ? "bg-red-500/10 text-red-500" :
                    "bg-amber-500/10 text-amber-500"
                  }`}>
                    {product.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <form action={async (formData: FormData) => {
                    "use server"
                    const status = formData.get("status") as ProductStatus
                    await updateProductStatus(product.id, status)
                  }} className="flex items-center justify-end gap-2">
                    <select name="status" defaultValue={product.status} className="h-8 rounded-lg border border-input bg-background px-2 text-xs">
                      <option value="PENDING">PENDING</option>
                      <option value="APPROVED">APPROVED</option>
                      <option value="REJECTED">REJECTED</option>
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
