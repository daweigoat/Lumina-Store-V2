import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface BrandCardProps {
  name: string
  slug: string
  logo: string
  className?: string
}

export function BrandCard({ name, slug, logo, className }: BrandCardProps) {
  return (
    <Link 
      href={`/brands/${slug}`}
      className={cn(
        "group flex items-center justify-center p-6 border border-border/40 bg-card rounded-2xl hover:border-primary/50 hover:shadow-soft transition-all duration-300 aspect-[3/2]",
        className
      )}
    >
      <div className="relative w-full h-full max-h-16 opacity-70 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-300">
        <Image
          src={logo || "/placeholder.jpg"}
          alt={name}
          fill
          unoptimized
          className="object-contain"
        />
      </div>
    </Link>
  )
}
