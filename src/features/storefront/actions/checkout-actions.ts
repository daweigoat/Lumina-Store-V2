"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { z } from "zod"
import { getCart } from "./cart-actions"
import { revalidatePath } from "next/cache"
import { RajaOngkirProvider } from "../services/shipping-provider"
import { MidtransProvider } from "../services/payment-provider"

const CheckoutSchema = z.object({
  shippingAddressId: z.string().min(1, "Please select a shipping address"),
  shippingOptionId: z.string().min(1, "Please select a shipping method"),
  paymentMethodId: z.string().min(1, "Please select a payment method"),
  voucherCode: z.string().optional(),
})

export async function processCheckout(formData: FormData) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      throw new Error("You must be logged in to checkout")
    }

    const userId = session.user.id

    const data = {
      shippingAddressId: formData.get("shippingAddressId") as string,
      shippingOptionId: formData.get("shippingOptionId") as string,
      paymentMethodId: formData.get("paymentMethodId") as string,
      voucherCode: formData.get("voucherCode") as string,
    }

    const parsed = CheckoutSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: "Invalid checkout data" }
    }

    const cart = await getCart()
    if (!cart || cart.items.length === 0) {
      return { success: false, error: "Your cart is empty" }
    }

    // Verify address belongs to user
    const address = await prisma.address.findUnique({
      where: { id: parsed.data.shippingAddressId }
    })
    
    if (!address || address.userId !== userId) {
      return { success: false, error: "Invalid shipping address" }
    }

    // Use Prisma transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // 1. Verify stock and price for all items
      let subtotal = 0
      const storeIds = new Set<string>()

      for (const item of cart.items) {
        const variant = await tx.variant.findUnique({
          where: { id: item.variant.id },
          include: { product: true }
        })

        if (!variant) {
          throw new Error(`Variant not found: ${item.variant.name}`)
        }

        // Calculate available stock by subtracting active reservations
        const activeReservations = await tx.stockReservation.aggregate({
          where: {
            productVariantId: variant.id,
            status: 'ACTIVE',
            expiresAt: { gt: new Date() }
          },
          _sum: { quantity: true }
        })

        const reservedQuantity = activeReservations._sum.quantity || 0
        const availableStock = (variant.inventory ?? 0) - reservedQuantity

        if (availableStock < item.quantity) {
          throw new Error(`Insufficient stock for ${variant.product.name} - ${variant.name}`)
        }

        subtotal += item.price * item.quantity
        storeIds.add(variant.product.storeId)
      }

      if (storeIds.size > 1) {
        throw new Error("Checkout currently supports one store per order")
      }
      
      const storeId = Array.from(storeIds)[0]

      // 2. Calculate totals
      const shippingProvider = new RajaOngkirProvider()
      const shippingOptions = await shippingProvider.getOptions({
        destinationPostalCode: address.postalCode,
        destinationCity: address.city,
        destinationState: address.state,
        itemsCount: cart.items.length
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const selectedShipping = shippingOptions.find((o: any) => o.id === parsed.data.shippingOptionId)
      if (!selectedShipping) {
        throw new Error("Invalid shipping option")
      }

      const shippingFee = selectedShipping.price
      const tax = subtotal * 0.1 // 10% tax stub
      const discount = 0 // Stub for vouchers
      const totalAmount = subtotal + shippingFee + tax - discount

      // 3. Create Order
      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`
      
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          storeId,
          shippingAddrId: address.id,
          subtotal,
          tax,
          shippingFee,
          discount,
          totalAmount,
          status: 'PENDING_PAYMENT',
          shippingMethod: selectedShipping.name,
          paymentMethod: parsed.data.paymentMethodId,
          items: {
            create: cart.items.map(item => ({
              variantId: item.variant.id,
              quantity: item.quantity,
              price: item.price,
            }))
          }
        }
      })

      // 4. Create Stock Reservations (Expires in 15 mins)
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000)
      
      for (const item of cart.items) {
        await tx.stockReservation.create({
          data: {
            orderId: order.id,
            productVariantId: item.variant.id,
            quantity: item.quantity,
            expiresAt,
            status: 'ACTIVE'
          }
        })
      }

      // 5. Empty Cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id }
      })

      return order
    })

    // Initialize Payment
    const paymentProvider = new MidtransProvider()
    const paymentResponse = await paymentProvider.initializePayment({
      orderId: result.id,
      amount: result.totalAmount,
      currency: "USD",
      customerEmail: session.user.email || undefined,
      customerName: session.user.name || undefined
    })

    if (!paymentResponse.success) {
      // In a real system we might log this or handle the failure
      return { success: false, error: "Failed to initialize payment" }
    }

    revalidatePath("/cart")
    
    return { 
      success: true, 
      orderId: result.id,
      paymentUrl: paymentResponse.paymentUrl 
    }

  } catch (error) {
    console.error("Checkout error:", error)
    return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" }
  }
}
