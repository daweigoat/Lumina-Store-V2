import { buttonVariants } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function CheckoutSuccessPage(
  props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }
) {
  const searchParams = await props.searchParams
  const orderId = typeof searchParams.orderId === "string" ? searchParams.orderId : undefined

  if (!orderId) {
    redirect("/")
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId }
  })

  if (!order) {
    redirect("/")
  }

  return (
    <main className="container mx-auto px-4 py-20 max-w-md text-center">
      <div className="bg-card rounded-3xl border border-border/40 p-8 shadow-sm">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-heading font-bold mb-2">Payment Successful!</h1>
        <p className="text-muted-foreground mb-8">
          Thank you for your purchase. Your order number is <span className="font-medium text-foreground">{order.orderNumber}</span>.
        </p>

        <Link href="/" className={buttonVariants({ className: "w-full h-12 text-base rounded-xl mb-4" })}>
          Continue Shopping
        </Link>
      </div>
    </main>
  )
}
