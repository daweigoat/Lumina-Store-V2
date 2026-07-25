"use client"

import Link from "next/link"
import { Search, ShoppingBag, User } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function MainNavbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 glass">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="font-heading font-bold text-xl tracking-tight">
          LuminaStore
        </Link>

        {/* Search */}
        <div className="hidden md:flex flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search products..." 
            className="pl-9 bg-background/50 border-border/50 focus-visible:ring-1"
          />
        </div>

        {/* Actions */}
        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
          <Link href="/login" className={buttonVariants({ variant: "ghost", size: "icon" })}>
            <User className="h-5 w-5" />
            <span className="sr-only">Account</span>
          </Link>
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingBag className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
            <span className="sr-only">Cart</span>
          </Button>
        </nav>
      </div>
    </header>
  )
}
