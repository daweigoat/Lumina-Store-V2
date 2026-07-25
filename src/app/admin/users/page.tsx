import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { updateUserStatus, updateUserRole } from "@/features/admin/actions/user-actions"
import { Role } from "@prisma/client"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function AdminUsersPage() {
  const session = await auth()
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/")
  }

  const isSuperAdmin = session.user.role === "SUPER_ADMIN"

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div>
        <h1 className="text-3xl font-heading font-bold">User Management</h1>
        <p className="text-muted-foreground mt-1">Manage accounts, roles, and suspensions.</p>
      </div>

      <div className="bg-card rounded-2xl border border-border/40 overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground border-b border-border/40">
            <tr>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 font-medium">{user.name || "N/A"}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">
                  {isSuperAdmin && user.id !== session.user.id ? (
                    <form action={async (formData: FormData) => {
                      "use server"
                      const role = formData.get("role") as Role
                      await updateUserRole(user.id, role)
                    }} className="flex items-center gap-2">
                      <select name="role" defaultValue={user.role} className="h-8 rounded-lg border border-input bg-background px-2 text-xs">
                        <option value="CUSTOMER">CUSTOMER</option>
                        <option value="SELLER">SELLER</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                      </select>
                      <button type="submit" className="text-xs font-medium text-primary hover:underline">Save</button>
                    </form>
                  ) : (
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                      {user.role}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.status === "ACTIVE" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {user.id !== session.user.id && (
                    <form action={async () => {
                      "use server"
                      const newStatus = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE"
                      await updateUserStatus(user.id, newStatus)
                    }}>
                      <Button variant="outline" size="sm" type="submit" className="rounded-xl text-xs h-8">
                        {user.status === "ACTIVE" ? "Suspend" : "Activate"}
                      </Button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
