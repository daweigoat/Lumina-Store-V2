"use client"

import * as React from "react"
import { ProductCard, type ProductCardProps } from "./product-card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

interface ProductCarouselProps {
  title?: string
  products: ProductCardProps[]
}

export function ProductCarousel({ title, products }: ProductCarouselProps) {
  if (!products?.length) return null

  return (
    <div className="w-full relative">
      {title && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-heading font-bold">{title}</h2>
        </div>
      )}
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {products.map((product) => (
            <CarouselItem key={product.id} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
              <ProductCard {...product} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="hidden md:block">
          <CarouselPrevious className="absolute -left-12 top-1/2 -translate-y-1/2" />
          <CarouselNext className="absolute -right-12 top-1/2 -translate-y-1/2" />
        </div>
      </Carousel>
    </div>
  )
}
