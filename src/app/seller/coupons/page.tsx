import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { upsertCoupon } from "@/features/seller/actions/coupon-actions"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function SellerCouponsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/")

  const store = await prisma.store.findFirst({
    where: { userId: session.user.id }
  })

  if (!store) redirect("/")

  const coupons = await prisma.coupon.findMany({
    where: { storeId: store.id },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div>
        <h1 className="text-3xl font-heading font-bold">Coupons</h1>
        <p className="text-muted-foreground mt-1">Manage promotional discounts for your store.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <form action={async (formData: FormData) => {
            "use server"
            const result = await upsertCoupon(formData)
            if (!result.success) console.error(result.error)
          }} className="space-y-4 bg-card rounded-2xl border border-border/40 p-6 shadow-sm sticky top-6">
            <h2 className="font-semibold mb-4">Create New Coupon</h2>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Code</label>
              <input name="code" required className="w-full h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring uppercase" placeholder="SUMMER2026" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <select name="discountType" required className="w-full h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FLAT">Flat Amount ($)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Value</label>
              <input type="number" step="0.01" name="discountValue" required className="w-full h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Valid From</label>
              <input type="datetime-local" name="validFrom" required className="w-full h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Valid Until</label>
              <input type="datetime-local" name="validUntil" required className="w-full h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>

            <Button type="submit" className="w-full rounded-xl mt-4">Create Coupon</Button>
          </form>
        </div>

        <div className="md:col-span-2 space-y-4">
          {coupons.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border/40 p-8 text-center text-muted-foreground">
              No coupons found. Create one to start offering discounts!
            </div>
          ) : (
            coupons.map(coupon => (
              <div key={coupon.id} className="bg-card rounded-2xl border border-border/40 p-6 shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-primary">{coupon.code}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {coupon.discountType === "PERCENTAGE" ? `${coupon.discountValue}% off` : `$${coupon.discountValue} off`}
                    {coupon.minSpend ? ` (Min. spend $${coupon.minSpend})` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Valid: {new Date(coupon.validFrom).toLocaleDateString()} - {new Date(coupon.validUntil).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium mb-1">Uses</p>
                  <p className="text-2xl font-bold">{coupon.usageCount}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
