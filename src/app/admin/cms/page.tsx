import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export const dynamic = "force-dynamic"

export default async function AdminCMSPage() {
  const session = await auth()
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/")
  }

  const pages = await prisma.cMSPage.findMany({
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div>
        <h1 className="text-3xl font-heading font-bold">CMS Pages</h1>
        <p className="text-muted-foreground mt-1">Manage static pages like About Us, Terms, etc.</p>
      </div>

      <div className="bg-card rounded-2xl border border-border/40 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border/40 bg-muted/20">
          <form action={async (formData: FormData) => {
            "use server"
            const title = formData.get("title") as string
            const slug = formData.get("slug") as string
            const content = formData.get("content") as string
            
            await prisma.cMSPage.create({
              data: { title, slug, content, isPublished: true }
            })
            revalidatePath("/admin/cms")
          }} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-2 gap-4">
              <input name="title" required placeholder="Page Title" className="h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              <input name="slug" required placeholder="page-slug" className="h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <textarea name="content" required placeholder="Page content (HTML/Text)" rows={4} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            <button type="submit" className="h-10 px-6 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors">
              Create Page
            </button>
          </form>
        </div>

        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground border-b border-border/40">
            <tr>
              <th className="px-6 py-4 font-medium">Title</th>
              <th className="px-6 py-4 font-medium">Slug</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {pages.map(page => (
              <tr key={page.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 font-medium">{page.title}</td>
                <td className="px-6 py-4">/{page.slug}</td>
                <td className="px-6 py-4">
                  {page.isPublished ? (
                    <span className="text-green-500 font-medium">Published</span>
                  ) : (
                    <span className="text-muted-foreground">Draft</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <form action={async () => {
                    "use server"
                    await prisma.cMSPage.delete({ where: { id: page.id } })
                    revalidatePath("/admin/cms")
                  }}>
                    <button type="submit" className="text-red-500 hover:underline font-medium text-xs">Delete</button>
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
