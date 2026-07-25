"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Users, Store, Package, Settings, LogOut, ShieldAlert } from "lucide-react"
import { cn } from "@/lib/utils"

const ADMIN_NAV = [
  { title: "Overview", href: "/admin", icon: ShieldAlert },
  { title: "Users", href: "/admin/users", icon: Users },
  { title: "Sellers", href: "/admin/sellers", icon: Store },
  { title: "Products", href: "/admin/products", icon: Package },
  { title: "Settings", href: "/admin/settings", icon: Settings },
]

export function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border/40 bg-card hidden md:block">
        <div className="h-16 flex items-center px-6 border-b border-border/40">
          <Link href="/" className="font-heading font-bold text-lg text-primary">
            Lumina Admin
          </Link>
        </div>
        <nav className="p-4 space-y-1">
          {ADMIN_NAV.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Link>
            )
          })}
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
          <Link 
            href="/api/auth/signout" 
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 border-b border-border/40 bg-card/50 backdrop-blur-sm flex items-center px-6">
          <h1 className="font-semibold">Platform Administration</h1>
        </header>
        <div className="flex-1 p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
