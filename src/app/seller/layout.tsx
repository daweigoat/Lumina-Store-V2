import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, Package, ShoppingCart, Ticket, Settings, Store } from "lucide-react"

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  
  if (!session?.user?.id || session.user.role !== "SELLER") {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border/40 bg-card hidden md:block">
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center gap-2 mb-8 text-primary font-heading font-bold text-xl">
            <Store className="w-6 h-6" />
            Seller Center
          </div>
          
          <nav className="flex-1 space-y-2">
            <Link href="/seller" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent hover:text-accent-foreground text-sm font-medium transition-colors">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link href="/seller/products" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent hover:text-accent-foreground text-sm font-medium transition-colors">
              <Package className="w-4 h-4" />
              Products
            </Link>
            <Link href="/seller/orders" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent hover:text-accent-foreground text-sm font-medium transition-colors">
              <ShoppingCart className="w-4 h-4" />
              Orders
            </Link>
            <Link href="/seller/coupons" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent hover:text-accent-foreground text-sm font-medium transition-colors">
              <Ticket className="w-4 h-4" />
              Coupons
            </Link>
          </nav>
          
          <div className="mt-auto pt-6 border-t border-border/40">
            <Link href="/seller/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent hover:text-accent-foreground text-sm font-medium transition-colors">
              <Settings className="w-4 h-4" />
              Settings
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
