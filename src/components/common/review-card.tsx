import * as React from "react"
import { RatingStars } from "./rating-stars"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ReviewCardProps {
  id: string
  authorName: string
  authorImage?: string
  rating: number
  date: string
  content: string
}

export function ReviewCard({
  authorName,
  authorImage,
  rating,
  date,
  content,
}: ReviewCardProps) {
  const initials = authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex flex-col gap-4 p-6 border border-border/40 rounded-2xl bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-border/50">
            <AvatarImage src={authorImage} alt={authorName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">{authorName}</span>
            <span className="text-xs text-muted-foreground">{date}</span>
          </div>
        </div>
        <RatingStars rating={rating} />
      </div>
      <p className="text-sm text-foreground/80 leading-relaxed">
        {content}
      </p>
    </div>
  )
}
