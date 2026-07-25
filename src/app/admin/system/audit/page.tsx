import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function AdminAuditLogsPage() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    redirect("/") // Only Super Admin can view audit logs
  }

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100 // Limit to recent 100 for performance
  })

  // Group user IDs to fetch names efficiently if needed, but for now we just show IDs
  // In a real app we'd join with the User table

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div>
        <h1 className="text-3xl font-heading font-bold">Audit Logs</h1>
        <p className="text-muted-foreground mt-1">Immutable record of critical administrative actions.</p>
      </div>

      <div className="bg-card rounded-2xl border border-border/40 overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground border-b border-border/40">
            <tr>
              <th className="px-6 py-4 font-medium">Timestamp</th>
              <th className="px-6 py-4 font-medium">Action</th>
              <th className="px-6 py-4 font-medium">Entity</th>
              <th className="px-6 py-4 font-medium">Entity ID</th>
              <th className="px-6 py-4 font-medium">Actor ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                  No audit logs found.
                </td>
              </tr>
            ) : (
              logs.map(log => (
                <tr key={log.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-medium">{log.createdAt.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4">{log.entity}</td>
                  <td className="px-6 py-4 font-mono text-xs">{log.entityId}</td>
                  <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{log.userId}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
