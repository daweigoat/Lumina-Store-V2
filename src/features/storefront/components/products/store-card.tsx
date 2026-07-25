import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { MapPin, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface StoreCardProps {
  id: string
  name: string
  slug: string
  logo?: string
  coverImage?: string
  location?: string
  rating?: number
  reviewsCount?: number
  description?: string
  className?: string
}

export function StoreCard({
  name,
  slug,
  logo,
  coverImage,
  location,
  rating = 0,
  reviewsCount = 0,
  description,
  className,
}: StoreCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <Card className={cn("overflow-hidden border-border/40 hover:shadow-soft transition-all group block", className)}>
      <Link href={`/store/${slug}`}>
        <CardHeader className="p-0">
          <div className="relative h-32 bg-muted overflow-hidden">
            <Image
              src={coverImage || "/placeholder.jpg"}
              alt={`${name} cover`}
              fill
              unoptimized
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>
        </CardHeader>
        <CardContent className="p-6 relative">
          <Avatar className="absolute -top-10 left-6 h-20 w-20 border-4 border-card shadow-md">
            <AvatarImage src={logo} alt={name} />
            <AvatarFallback className="text-lg font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div className="mt-10">
            <h3 className="font-heading font-semibold text-lg hover:underline decoration-primary underline-offset-4">
              {name}
            </h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {description}
              </p>
            )}
            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              {location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{location}</span>
                </div>
              )}
              {rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <span className="font-medium text-foreground">{rating.toFixed(1)}</span>
                  <span>({reviewsCount})</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}
