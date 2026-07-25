import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { Plus } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function SellerProductsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/")

  const store = await prisma.store.findFirst({
    where: { userId: session.user.id }
  })

  if (!store) redirect("/")

  const products = await prisma.product.findMany({
    where: { storeId: store.id },
    include: { variants: true },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-heading font-bold">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your store&apos;s inventory.</p>
        </div>
        <Link href="/seller/products/new" className={buttonVariants({ className: "gap-2" })}>
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      <div className="bg-card rounded-2xl border border-border/40 overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground border-b border-border/40">
            <tr>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Price</th>
              <th className="px-6 py-4 font-medium">Inventory</th>
              <th className="px-6 py-4 font-medium">Variants</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                  No products found. Add your first product!
                </td>
              </tr>
            ) : (
              products.map(product => (
                <tr key={product.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-medium">{product.name}</td>
                  <td className="px-6 py-4">${product.price.toFixed(2)}</td>
                  <td className="px-6 py-4">{product.inventory}</td>
                  <td className="px-6 py-4">{product.variants.length}</td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/seller/products/${product.id}`} className="text-primary hover:underline font-medium">
                      Edit
                    </Link>
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
