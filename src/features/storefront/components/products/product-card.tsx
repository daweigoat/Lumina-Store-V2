"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { ShoppingBag, Star } from "lucide-react"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export interface ProductCardProps {
  id: string
  name: string
  slug: string
  price: number
  salePrice?: number | null
  image: string
  rating?: number
  reviewsCount?: number
  brand?: string
  className?: string
}

export function ProductCard({
  id,
  name,
  slug,
  price,
  salePrice,
  image,
  rating = 0,
  reviewsCount = 0,
  brand,
  className,
}: ProductCardProps) {
  const isSale = salePrice && salePrice < price
  const displayPrice = isSale ? salePrice : price

  return (
    <motion.div
      data-product-id={id}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn("group h-full", className)}
    >
      <Card className="h-full flex flex-col overflow-hidden border-border/40 bg-card hover:shadow-soft transition-all">
        {/* Image Section */}
        <div className="relative aspect-[4/5] overflow-hidden bg-muted/30">
          {isSale && (
            <Badge className="absolute top-2 left-2 z-10 bg-destructive text-destructive-foreground hover:bg-destructive">
              Sale
            </Badge>
          )}
          <Link href={`/product/${slug}`} className="block w-full h-full relative">
            <Image
              src={image || "/placeholder.jpg"}
              alt={name}
              fill
              unoptimized
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
            />
          </Link>
          <div className="absolute bottom-4 left-0 w-full flex justify-center translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 px-4">
            <Button className="w-full glass-dark text-white rounded-full shadow-lg" size="sm">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
          </div>
        </div>

        {/* Content Section */}
        <CardContent className="p-4 flex-1 flex flex-col">
          {brand && (
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-medium">
              {brand}
            </p>
          )}
          <Link href={`/product/${slug}`} className="line-clamp-2 font-medium mb-2 hover:underline">
            {name}
          </Link>
          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lg">${displayPrice.toFixed(2)}</span>
              {isSale && (
                <span className="text-sm text-muted-foreground line-through">
                  ${price.toFixed(2)}
                </span>
              )}
            </div>
            {rating > 0 && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Star className="h-3 w-3 fill-primary text-primary mr-1" />
                <span>{rating.toFixed(1)}</span>
                <span className="ml-1">({reviewsCount})</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
