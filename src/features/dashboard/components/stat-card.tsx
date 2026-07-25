import * as React from "react"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("border-border/40 hover:shadow-soft transition-all", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex flex-col gap-1 text-sm text-muted-foreground font-medium">
            {title}
          </div>
          <div className="p-2 bg-primary/10 rounded-full text-primary">
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-1">
          <span className="text-3xl font-bold tracking-tight">{value}</span>
          {(description || trend) && (
            <div className="flex items-center text-sm mt-1 gap-2">
              {trend && (
                <span
                  className={cn(
                    "font-medium",
                    trend.isPositive ? "text-green-600" : "text-destructive"
                  )}
                >
                  {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
                </span>
              )}
              {description && <span className="text-muted-foreground">{description}</span>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
