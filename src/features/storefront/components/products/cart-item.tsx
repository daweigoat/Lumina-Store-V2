"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Price } from "@/components/common/price-component"

interface CartItemProps {
  id: string
  productSlug: string
  name: string
  variant?: string
  image: string
  price: number
  salePrice?: number | null
  quantity: number
  maxQuantity?: number
  onUpdateQuantity?: (id: string, newQuantity: number) => void
  onRemove?: (id: string) => void
}

export function CartItem({
  id,
  productSlug,
  name,
  variant,
  image,
  price,
  salePrice,
  quantity,
  maxQuantity = 10,
  onUpdateQuantity,
  onRemove,
}: CartItemProps) {
  return (
    <div className="flex gap-4 py-4 border-b border-border/40">
      {/* Image */}
      <div className="relative w-24 h-24 sm:w-32 sm:h-32 bg-muted/20 rounded-xl overflow-hidden flex-shrink-0 border border-border/40">
        <Link href={`/product/${productSlug}`}>
          <Image
            src={image || "/placeholder.jpg"}
            alt={name}
            fill
            unoptimized
            className="object-cover"
          />
        </Link>
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex justify-between items-start gap-2">
          <div>
            <Link 
              href={`/product/${productSlug}`}
              className="font-medium hover:underline line-clamp-2 sm:line-clamp-1"
            >
              {name}
            </Link>
            {variant && (
              <p className="text-sm text-muted-foreground mt-0.5">{variant}</p>
            )}
            <div className="mt-1">
              <Price price={price} salePrice={salePrice} className="text-sm sm:text-base" />
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive shrink-0"
            onClick={() => onRemove?.(id)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Remove</span>
          </Button>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center mt-4 sm:mt-0">
          <div className="flex items-center border border-border/50 rounded-lg bg-background">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-r-none"
              disabled={quantity <= 1}
              onClick={() => onUpdateQuantity?.(id, quantity - 1)}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center text-sm font-medium">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-l-none"
              disabled={quantity >= maxQuantity}
              onClick={() => onUpdateQuantity?.(id, quantity + 1)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
