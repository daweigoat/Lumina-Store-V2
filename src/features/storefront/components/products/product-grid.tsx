import * as React from "react"
import { ProductCard, type ProductCardProps } from "./product-card"
import { cn } from "@/lib/utils"

interface ProductGridProps {
  products: ProductCardProps[]
  className?: string
}

export function ProductGrid({ products, className }: ProductGridProps) {
  if (!products?.length) {
    return (
      <div className="py-12 text-center text-muted-foreground border border-dashed rounded-lg">
        <p>No products found.</p>
      </div>
    )
  }

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6", className)}>
      {products.map((product) => (
        <ProductCard key={product.id} {...product} />
      ))}
    </div>
  )
}
