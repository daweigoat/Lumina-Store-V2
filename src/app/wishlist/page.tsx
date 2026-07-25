import { getWishlist } from "@/features/storefront/actions/wishlist-actions"
import { ProductGrid } from "@/features/storefront/components/products/product-grid"
import { buttonVariants } from "@/components/ui/button"
import Link from "next/link"
import { Heart } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function WishlistPage() {
  const wishlist = await getWishlist()
  const products = wishlist?.products || []

  const formattedProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    salePrice: p.salePrice,
    image: p.images[0] || "/placeholder.jpg",
    rating: 0, // Wishlist doesn't fetch reviews deeply for performance
    reviewsCount: 0,
    brand: p.brand?.name,
  }))

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-heading font-bold mb-8">Your Wishlist</h1>
      
      {formattedProducts.length === 0 ? (
        <div className="text-center py-20 bg-muted/20 rounded-2xl border border-border/40">
          <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
          <p className="text-muted-foreground mb-6">Save items you love to view them later.</p>
          <Link href="/" className={buttonVariants()}>
            Explore Products
          </Link>
        </div>
      ) : (
        <ProductGrid products={formattedProducts} />
      )}
    </main>
  )
}
