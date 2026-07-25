import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { createBanner } from "@/features/admin/actions/cms-actions"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function AdminBannersPage() {
  const session = await auth()
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/")
  }

  const banners = await prisma.banner.findMany({
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div>
        <h1 className="text-3xl font-heading font-bold">Banners</h1>
        <p className="text-muted-foreground mt-1">Manage homepage and promotional banners.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <form action={async (formData: FormData) => {
            "use server"
            const result = await createBanner(formData)
            if (!result.success) console.error(result.error)
          }} className="space-y-4 bg-card rounded-2xl border border-border/40 p-6 shadow-sm sticky top-6">
            <h2 className="font-semibold mb-4">Add New Banner</h2>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <input name="title" required className="w-full h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Image URL</label>
              <input name="imageUrl" type="url" required className="w-full h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Link URL (Optional)</label>
              <input name="linkUrl" type="url" className="w-full h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Position</label>
              <select name="position" required className="w-full h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="HOMEPAGE">Homepage</option>
                <option value="PROMO">Promotional Strip</option>
              </select>
            </div>

            <Button type="submit" className="w-full rounded-xl mt-4">Create Banner</Button>
          </form>
        </div>

        <div className="md:col-span-2 space-y-4">
          {banners.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border/40 p-8 text-center text-muted-foreground">
              No banners found.
            </div>
          ) : (
            banners.map(banner => (
              <div key={banner.id} className="bg-card rounded-2xl border border-border/40 p-6 shadow-sm flex items-center gap-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={banner.imageUrl} alt={banner.title} className="w-32 h-20 object-cover rounded-lg bg-muted" />
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{banner.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">Position: {banner.position}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${banner.isActive ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'}`}>
                  {banner.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
