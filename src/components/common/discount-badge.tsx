import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface DiscountBadgeProps {
  discountPercent: number
  className?: string
}

export function DiscountBadge({ discountPercent, className }: DiscountBadgeProps) {
  if (discountPercent <= 0) return null

  return (
    <Badge
      className={cn(
        "bg-destructive hover:bg-destructive text-destructive-foreground font-semibold px-2 py-0.5",
        className
      )}
    >
      -{Math.round(discountPercent)}%
    </Badge>
  )
}
