import { getCart } from "@/features/storefront/actions/cart-actions"
import { CartItem } from "@/features/storefront/components/products/cart-item"
import { buttonVariants } from "@/components/ui/button"
import Link from "next/link"
import { ShoppingBag } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function CartPage() {
  const cart = await getCart()
  
  const items = cart?.items || []
  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0)

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-heading font-bold mb-8">Your Cart</h1>
      
      {items.length === 0 ? (
        <div className="text-center py-20 bg-muted/20 rounded-2xl border border-border/40">
          <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Looks like you haven&apos;t added anything yet.</p>
          <Link href="/" className={buttonVariants()}>
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Cart Items */}
          <div className="flex-1 space-y-4">
            {items.map(item => (
              <CartItem 
                key={item.id}
                id={item.id}
                productSlug={item.variant.product.slug}
                name={item.variant.product.name}
                variant={item.variant.name !== "Default" ? `${item.variant.name}: ${item.variant.value}` : undefined}
                price={item.price}
                quantity={item.quantity}
                image={item.variant.product.images[0] || "/placeholder.jpg"}
              />
            ))}
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-[400px]">
            <div className="bg-card rounded-2xl border border-border/40 p-6 shadow-sm sticky top-24">
              <h2 className="text-xl font-heading font-bold mb-6">Order Summary</h2>
              
              <div className="space-y-4 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">Calculated at checkout</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-medium">Calculated at checkout</span>
                </div>
                
                <div className="pt-4 border-t border-border flex justify-between text-base font-bold">
                  <span>Estimated Total</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
              </div>

              <Link href="/checkout" className={buttonVariants({ className: "w-full h-12 text-base rounded-xl" })}>
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
