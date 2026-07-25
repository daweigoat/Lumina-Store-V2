import * as React from "react"
import { cn } from "@/lib/utils"

interface PriceProps {
  price: number
  salePrice?: number | null
  className?: string
  currency?: string
}

export function Price({ price, salePrice, className, currency = "$" }: PriceProps) {
  const isSale = salePrice && salePrice < price
  const displayPrice = isSale ? salePrice : price

  return (
    <div className={cn("flex flex-wrap items-baseline gap-2", className)}>
      <span className="font-semibold text-lg tracking-tight">
        {currency}{displayPrice.toFixed(2)}
      </span>
      {isSale && (
        <span className="text-sm text-muted-foreground line-through decoration-muted-foreground/50">
          {currency}{price.toFixed(2)}
        </span>
      )}
    </div>
  )
}
