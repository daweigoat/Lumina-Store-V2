import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface DataCardProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  action?: React.ReactNode
}

export function DataCard({
  title,
  description,
  children,
  className,
  action,
}: DataCardProps) {
  return (
    <Card className={cn("border-border/40 hover:shadow-soft transition-all", className)}>
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
        <div className="flex flex-col gap-1.5">
          <CardTitle className="text-xl font-heading tracking-tight">{title}</CardTitle>
          {description && (
            <CardDescription className="text-sm">{description}</CardDescription>
          )}
        </div>
        {action && <div>{action}</div>}
      </CardHeader>
      <CardContent className="pt-4">
        {children}
      </CardContent>
    </Card>
  )
}
