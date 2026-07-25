import * as React from "react"
import Link from "next/link"

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="absolute top-4 left-4 md:top-8 md:left-8">
        <Link href="/" className="font-heading font-bold text-xl tracking-tight">
          LuminaStore
        </Link>
      </div>
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
}
