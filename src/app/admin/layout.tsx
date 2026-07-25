import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { 
  LayoutDashboard, Users, Package, ShoppingCart, 
  FileText, Ticket, Settings, ShieldAlert 
} from "lucide-react"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border/40 bg-card hidden md:block">
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center gap-2 mb-8 text-primary font-heading font-bold text-xl">
            <ShieldAlert className="w-6 h-6" />
            Lumina Admin
          </div>
          
          <nav className="flex-1 space-y-1">
            <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-accent hover:text-accent-foreground text-sm font-medium transition-colors">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link href="/admin/users" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-accent hover:text-accent-foreground text-sm font-medium transition-colors">
              <Users className="w-4 h-4" />
              Users
            </Link>
            <Link href="/admin/products" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-accent hover:text-accent-foreground text-sm font-medium transition-colors">
              <Package className="w-4 h-4" />
              Products
            </Link>
            <Link href="/admin/orders" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-accent hover:text-accent-foreground text-sm font-medium transition-colors">
              <ShoppingCart className="w-4 h-4" />
              Orders
            </Link>
            <Link href="/admin/cms" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-accent hover:text-accent-foreground text-sm font-medium transition-colors">
              <FileText className="w-4 h-4" />
              CMS & Content
            </Link>
            <Link href="/admin/marketing" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-accent hover:text-accent-foreground text-sm font-medium transition-colors">
              <Ticket className="w-4 h-4" />
              Marketing
            </Link>
          </nav>
          
          <div className="mt-auto pt-6 border-t border-border/40 space-y-1">
            <Link href="/admin/system/audit" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-accent hover:text-accent-foreground text-sm font-medium transition-colors">
              <Settings className="w-4 h-4" />
              Audit Logs
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
