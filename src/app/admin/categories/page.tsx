import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export const dynamic = "force-dynamic"

export default async function AdminCategoriesPage() {
  const session = await auth()
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/")
  }

  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div>
        <h1 className="text-3xl font-heading font-bold">Categories</h1>
        <p className="text-muted-foreground mt-1">Manage platform product categories.</p>
      </div>

      <div className="bg-card rounded-2xl border border-border/40 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border/40">
          <form action={async (formData: FormData) => {
            "use server"
            const name = formData.get("name") as string
            const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
            await prisma.category.create({ data: { name, slug } })
            revalidatePath("/admin/categories")
          }} className="flex gap-4">
            <input name="name" required placeholder="New Category Name" className="flex-1 h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            <button type="submit" className="h-10 px-6 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors">
              Add Category
            </button>
          </form>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground border-b border-border/40">
            <tr>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Slug</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {categories.map(cat => (
              <tr key={cat.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 font-medium">{cat.name}</td>
                <td className="px-6 py-4">{cat.slug}</td>
                <td className="px-6 py-4 text-right">
                  <form action={async () => {
                    "use server"
                    await prisma.category.delete({ where: { id: cat.id } })
                    revalidatePath("/admin/categories")
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
