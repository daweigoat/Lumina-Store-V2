import * as React from "react"
import { MainNavbar } from "@/features/storefront/components/main-navbar"
import { MainFooter } from "@/features/storefront/components/main-footer"
import { AnnouncementBar } from "@/features/storefront/components/announcement-bar"

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <AnnouncementBar />
      <MainNavbar />
      <main className="flex-1">{children}</main>
      <MainFooter />
    </div>
  )
}
