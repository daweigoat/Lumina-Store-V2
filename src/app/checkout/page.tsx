import { getCart } from "@/features/storefront/actions/cart-actions"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { processCheckout } from "@/features/storefront/actions/checkout-actions"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function CheckoutPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/api/auth/signin?callbackUrl=/checkout")
  }

  const cart = await getCart()
  if (!cart || cart.items.length === 0) {
    redirect("/cart")
  }

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id }
  })

  const subtotal = cart.items.reduce((acc, item) => acc + (item.price * item.quantity), 0)

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-heading font-bold mb-8">Checkout</h1>

      <form action={async (formData: FormData) => {
        "use server"
        const result = await processCheckout(formData)
        if (result.success && result.paymentUrl) {
          redirect(result.paymentUrl)
        } else if (!result.success) {
          // In a real app we'd use useActionState to show this error
          console.error(result.error)
        }
      }}>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            
            {/* Address Selection */}
            <section className="bg-card rounded-2xl border border-border/40 p-6">
              <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
              {addresses.length === 0 ? (
                <p className="text-muted-foreground text-sm">No addresses found. (Stub: Add address UI goes here)</p>
              ) : (
                <div className="space-y-3">
                  {addresses.map(address => (
                    <label key={address.id} className="flex items-start p-4 border rounded-xl cursor-pointer hover:border-primary">
                      <input type="radio" name="shippingAddressId" value={address.id} className="mt-1" defaultChecked={address.isDefault} required />
                      <div className="ml-3">
                        <p className="font-medium">{address.street}</p>
                        <p className="text-sm text-muted-foreground">{address.city}, {address.state} {address.postalCode}</p>
                        <p className="text-sm text-muted-foreground">{address.country}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </section>

            {/* Shipping Method */}
            <section className="bg-card rounded-2xl border border-border/40 p-6">
              <h2 className="text-xl font-semibold mb-4">Shipping Method</h2>
              <div className="space-y-3">
                <label className="flex justify-between items-center p-4 border rounded-xl cursor-pointer hover:border-primary">
                  <div className="flex items-center">
                    <input type="radio" name="shippingOptionId" value="standard" required defaultChecked />
                    <div className="ml-3">
                      <p className="font-medium">Standard Shipping</p>
                      <p className="text-sm text-muted-foreground">3-5 business days</p>
                    </div>
                  </div>
                  <span className="font-medium">$5.00</span>
                </label>
                <label className="flex justify-between items-center p-4 border rounded-xl cursor-pointer hover:border-primary">
                  <div className="flex items-center">
                    <input type="radio" name="shippingOptionId" value="express" required />
                    <div className="ml-3">
                      <p className="font-medium">Express Shipping</p>
                      <p className="text-sm text-muted-foreground">1 business day</p>
                    </div>
                  </div>
                  <span className="font-medium">$15.00</span>
                </label>
              </div>
            </section>

            {/* Payment Method */}
            <section className="bg-card rounded-2xl border border-border/40 p-6">
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
              <div className="space-y-3">
                <label className="flex items-center p-4 border rounded-xl cursor-pointer hover:border-primary">
                  <input type="radio" name="paymentMethodId" value="mock_gateway" required defaultChecked />
                  <span className="ml-3 font-medium">Mock Payment Gateway</span>
                </label>
              </div>
            </section>

          </div>

          {/* Order Summary */}
          <div className="bg-card rounded-2xl border border-border/40 p-6 h-fit sticky top-24">
            <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
            
            <div className="space-y-4 text-sm mb-6 pb-6 border-b border-border/40">
              {cart.items.map(item => (
                <div key={item.id} className="flex justify-between">
                  <span className="text-muted-foreground line-clamp-1">{item.quantity}x {item.variant.product.name}</span>
                  <span className="font-medium ml-4">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping & Tax</span>
                <span>Calculated dynamically</span>
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-base rounded-xl" disabled={addresses.length === 0}>
              Place Order
            </Button>
          </div>
        </div>
      </form>
    </main>
  )
}
