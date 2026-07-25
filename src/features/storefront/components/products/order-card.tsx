import * as React from "react"
import Link from "next/link"
import { Package, Clock, CheckCircle2, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED"

interface OrderCardProps {
  id: string
  date: string
  total: number
  status: OrderStatus
  itemCount: number
  storeName?: string
}

export function OrderCard({
  id,
  date,
  total,
  status,
  itemCount,
  storeName,
}: OrderCardProps) {
  const statusConfig = {
    PENDING: { icon: Clock, color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
    PROCESSING: { icon: Package, color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
    SHIPPED: { icon: Package, color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20" },
    DELIVERED: { icon: CheckCircle2, color: "bg-green-500/10 text-green-600 border-green-500/20" },
    CANCELLED: { icon: XCircle, color: "bg-destructive/10 text-destructive border-destructive/20" },
  }

  const config = statusConfig[status]
  const StatusIcon = config.icon

  return (
    <Card className="overflow-hidden border-border/40 hover:shadow-soft transition-all">
      <CardHeader className="bg-muted/20 border-b border-border/40 py-4 px-6 flex flex-row items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 text-sm">
          <div>
            <span className="text-muted-foreground mr-2">Order</span>
            <span className="font-semibold font-mono">#{id.slice(-8).toUpperCase()}</span>
          </div>
          <div className="hidden md:block w-1 h-1 rounded-full bg-border" />
          <div>
            <span className="text-muted-foreground mr-2">Date</span>
            <span className="font-medium">{date}</span>
          </div>
        </div>
        <Badge variant="outline" className={`gap-1.5 py-1 ${config.color}`}>
          <StatusIcon className="h-3.5 w-3.5" />
          {status}
        </Badge>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex flex-col gap-1">
            {storeName && (
              <p className="text-sm font-medium text-foreground">
                Sold by <span className="text-primary">{storeName}</span>
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </p>
            <p className="font-semibold text-lg mt-2">
              ${total.toFixed(2)}
            </p>
          </div>
          <div className="flex items-end md:items-center gap-2">
            <Link href={`/orders/${id}`} className={buttonVariants({ variant: "outline" })}>
              View Details
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
