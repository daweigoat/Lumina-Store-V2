"use client"

import * as React from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface ProductImageGalleryProps {
  images: string[]
  productName: string
}

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const displayImages = images?.length > 0 ? images : ["/placeholder.jpg"]

  return (
    <div className="flex flex-col md:flex-row-reverse gap-4">
      {/* Main Image */}
      <div className="relative flex-1 aspect-square md:aspect-[4/5] bg-muted/20 rounded-2xl overflow-hidden border border-border/40">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <Image
              src={displayImages[currentIndex]}
              alt={`${productName} - Image ${currentIndex + 1}`}
              fill
              unoptimized
              className="object-cover"
              priority
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:w-24 pb-2 md:pb-0 hide-scrollbar">
          {displayImages.map((image, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "relative flex-shrink-0 w-20 md:w-full aspect-square rounded-xl overflow-hidden border-2 transition-all",
                currentIndex === index 
                  ? "border-primary shadow-soft" 
                  : "border-transparent opacity-60 hover:opacity-100 hover:border-border"
              )}
            >
              <Image
                src={image}
                alt={`${productName} thumbnail ${index + 1}`}
                fill
                unoptimized
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
