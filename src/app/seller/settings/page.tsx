import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { updateStoreSettings } from "@/features/seller/actions/store-actions"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function SellerSettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/")

  const store = await prisma.store.findFirst({
    where: { userId: session.user.id }
  })

  if (!store) redirect("/")

  return (
    <div className="space-y-8 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div>
        <h1 className="text-3xl font-heading font-bold">Store Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your public profile and shipping defaults.</p>
      </div>

      <form action={async (formData: FormData) => {
        "use server"
        const result = await updateStoreSettings(formData)
        if (!result.success) console.error(result.error)
      }} className="space-y-8 bg-card rounded-2xl border border-border/40 p-8 shadow-sm">
        
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Store Profile</h2>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Store Name</label>
            <input 
              name="name" 
              defaultValue={store.name} 
              required 
              className="w-full h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea 
              name="description" 
              defaultValue={store.description || ""} 
              rows={4}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" 
            />
          </div>
        </section>

        <section className="space-y-4 pt-6 border-t border-border/40">
          <h2 className="text-xl font-semibold">Shipping Defaults</h2>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Default Shipping Fee ($)</label>
            <input 
              type="number" 
              step="0.01" 
              name="defaultShippingFee" 
              defaultValue={store.defaultShippingFee || ""} 
              className="w-full h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" 
            />
            <p className="text-xs text-muted-foreground">This fee will be used if advanced shipping calculation is unavailable.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Shipping Origin (City/Zip)</label>
            <input 
              name="shippingOrigin" 
              defaultValue={store.shippingOrigin || ""} 
              className="w-full h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" 
              placeholder="e.g. New York, 10001"
            />
          </div>
        </section>

        <div className="pt-6 border-t border-border/40 flex justify-end">
          <Button type="submit" className="rounded-xl px-8">Save Changes</Button>
        </div>
      </form>
    </div>
  )
}
