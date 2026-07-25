import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { upsertProduct } from "@/features/seller/actions/product-actions"

export const dynamic = "force-dynamic"

export default async function SellerProductEditorPage(
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params
  const session = await auth()
  if (!session?.user?.id) redirect("/")

  const isNew = params.id === "new"
  let product = null

  const categories = await prisma.category.findMany()

  if (!isNew) {
    product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { variants: true }
    })
    if (!product) redirect("/seller/products")
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div>
        <h1 className="text-3xl font-heading font-bold">{isNew ? "New Product" : "Edit Product"}</h1>
        <p className="text-muted-foreground mt-1">Fill in the details for your product.</p>
      </div>

      <form action={async (formData: FormData) => {
        "use server"
        if (!isNew) formData.append("id", params.id)
        const result = await upsertProduct(formData)
        if (result.success) {
          redirect("/seller/products")
        } else {
          console.error(result.error)
        }
      }} className="space-y-6 bg-card rounded-2xl border border-border/40 p-8 shadow-sm">
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Name</label>
          <input 
            type="text" 
            name="name" 
            defaultValue={product?.name}
            required 
            className="w-full flex h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <textarea 
            name="description" 
            defaultValue={product?.description}
            required 
            rows={4}
            className="w-full flex rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" 
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Price ($)</label>
            <input 
              type="number" 
              name="price" 
              step="0.01"
              defaultValue={product?.price}
              required 
              className="w-full flex h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Base Inventory</label>
            <input 
              type="number" 
              name="inventory" 
              defaultValue={product?.inventory}
              required 
              className="w-full flex h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <select 
            name="categoryId" 
            defaultValue={product?.categoryId}
            required
            className="w-full flex h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Select a category...</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="pt-6 border-t border-border/40 flex justify-end gap-4">
          <Button variant="outline" type="button" className="rounded-xl">Cancel</Button>
          <Button type="submit" className="rounded-xl">Save Product</Button>
        </div>
      </form>
    </div>
  )
}
