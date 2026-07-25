import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"

interface CategoryCardProps {
  name: string
  slug: string
  image: string
  itemCount?: number
  className?: string
}

export function CategoryCard({ name, slug, image, itemCount, className }: CategoryCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={cn("group block", className)}
    >
      <Link href={`/categories/${slug}`}>
        <Card className="overflow-hidden border-border/40 bg-card hover:border-primary/50 transition-colors">
          <div className="relative aspect-[4/3] bg-muted/30 overflow-hidden">
            <Image
              src={image || "/placeholder.jpg"}
              alt={name}
              fill
              unoptimized
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h3 className="font-heading font-semibold text-lg drop-shadow-md">{name}</h3>
              {itemCount !== undefined && (
                <p className="text-sm text-white/80">{itemCount} items</p>
              )}
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  )
}
