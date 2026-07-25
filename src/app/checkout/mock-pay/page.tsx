import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { commitOrderPayment, releaseOrderPayment } from "@/features/storefront/actions/order-actions"

export const dynamic = "force-dynamic"

export default async function MockPayPage(
  props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }
) {
  const searchParams = await props.searchParams
  const orderId = typeof searchParams.orderId === "string" ? searchParams.orderId : undefined
  const amount = typeof searchParams.amount === "string" ? searchParams.amount : undefined

  if (!orderId || !amount) {
    redirect("/")
  }

  const handleSuccess = async () => {
    "use server"
    const result = await commitOrderPayment(orderId, `MOCK_TX_${Date.now()}`)
    if (result.success) {
      redirect(`/checkout/success?orderId=${orderId}`)
    }
  }

  const handleFail = async () => {
    "use server"
    await releaseOrderPayment(orderId)
    redirect("/cart?error=payment_failed")
  }

  return (
    <main className="container mx-auto px-4 py-20 max-w-md text-center">
      <div className="bg-card rounded-3xl border border-border/40 p-8 shadow-sm">
        <h1 className="text-2xl font-bold mb-2">Mock Payment Gateway</h1>
        <p className="text-muted-foreground mb-8">
          You are paying <span className="font-bold text-foreground">${parseFloat(amount).toFixed(2)}</span> for order {orderId}
        </p>

        <div className="space-y-4">
          <form action={handleSuccess}>
            <Button type="submit" className="w-full h-12 text-base rounded-xl bg-green-600 hover:bg-green-700 text-white">
              Simulate Payment Success
            </Button>
          </form>

          <form action={handleFail}>
            <Button type="submit" variant="destructive" className="w-full h-12 text-base rounded-xl">
              Simulate Payment Failure
            </Button>
          </form>
        </div>
      </div>
    </main>
  )
}
