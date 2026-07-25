import * as React from "react"
import { Star, StarHalf } from "lucide-react"
import { cn } from "@/lib/utils"

interface RatingStarsProps {
  rating: number
  maxRating?: number
  className?: string
  starClassName?: string
}

export function RatingStars({
  rating,
  maxRating = 5,
  className,
  starClassName,
}: RatingStarsProps) {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: maxRating }).map((_, i) => {
        if (i < fullStars) {
          return (
            <Star
              key={i}
              className={cn("h-4 w-4 fill-primary text-primary", starClassName)}
            />
          )
        }
        if (i === fullStars && hasHalfStar) {
          return (
            <StarHalf
              key={i}
              className={cn("h-4 w-4 fill-primary text-primary", starClassName)}
            />
          )
        }
        return (
          <Star
            key={i}
            className={cn("h-4 w-4 text-muted-foreground", starClassName)}
          />
        )
      })}
    </div>
  )
}
