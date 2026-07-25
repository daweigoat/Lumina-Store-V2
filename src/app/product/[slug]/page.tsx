import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ProductImageGallery } from "@/features/storefront/components/products/product-image-gallery"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Heart, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { addToCart } from "@/features/storefront/actions/cart-actions"
import { toggleWishlistItem } from "@/features/storefront/actions/wishlist-actions"
import { ProductCarousel } from "@/features/storefront/components/products/product-carousel"

// Needs to be a server component that handles form submission for Add To Cart.
// Wait, we can use a client component for the Add to Cart button, or just a form with action.
// Let's use a server action directly in a form.

export default async function ProductPage(
  props: { params: Promise<{ slug: string }> }
) {
  const params = await props.params;
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      category: true,
      brand: true,
      variants: true,
      store: { select: { name: true } },
      reviews: { select: { rating: true } }
    }
  })

  if (!product) {
    notFound()
  }

  const avgRating = product.reviews.length > 0 
    ? product.reviews.reduce((a, r) => a + r.rating, 0) / product.reviews.length 
    : 0

  const isSale = product.salePrice && product.salePrice < product.price
  const displayPrice = isSale ? product.salePrice! : product.price
  const defaultVariant = product.variants[0] // Assume first variant is default

  // Related products (same category)
  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id } },
    take: 8,
    include: { brand: true, reviews: { select: { rating: true } } }
  })

  const formattedRelated = related.map(p => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    salePrice: p.salePrice,
    image: p.images[0] || "/placeholder.jpg",
    rating: p.reviews.length > 0 ? p.reviews.reduce((acc, rev) => acc + rev.rating, 0) / p.reviews.length : 0,
    reviewsCount: p.reviews.length,
    brand: p.brand?.name,
  }))

  const addToCartAction = async (formData: FormData) => {
    "use server"
    const variantId = formData.get("variantId") as string
    if (variantId) {
      await addToCart(variantId, 1)
    }
  }

  const toggleWishlistAction = async () => {
    "use server"
    await toggleWishlistItem(product.id)
  }

  return (
    <main className="container mx-auto px-4 py-8 space-y-16">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        <ProductImageGallery images={product.images} productName={product.name} />

        <div className="flex flex-col space-y-6">
          <div>
            {product.brand && (
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2 font-medium">
                {product.brand.name}
              </p>
            )}
            <h1 className="text-3xl md:text-4xl font-heading font-bold mb-4">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">${displayPrice.toFixed(2)}</span>
                {isSale && (
                  <span className="text-lg text-muted-foreground line-through">
                    ${product.price.toFixed(2)}
                  </span>
                )}
              </div>
              
              {isSale && (
                <Badge className="bg-destructive text-destructive-foreground">Sale</Badge>
              )}
            </div>

            {avgRating > 0 && (
              <div className="flex items-center text-sm text-muted-foreground mb-6">
                <Star className="h-4 w-4 fill-primary text-primary mr-1" />
                <span className="font-medium mr-1">{avgRating.toFixed(1)}</span>
                <span>({product.reviews.length} reviews)</span>
              </div>
            )}

            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          <div className="pt-6 border-t border-border/40">
            <p className="text-sm font-medium mb-4">Variants (Stub):</p>
            <div className="flex gap-2 flex-wrap mb-6">
              {product.variants.map(v => (
                <Badge key={v.id} variant="outline" className="px-3 py-1 cursor-pointer hover:bg-accent">
                  {v.name}: {v.value}
                </Badge>
              ))}
              {product.variants.length === 0 && (
                <span className="text-sm text-muted-foreground">Standard Edition</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 mt-auto pt-6">
            <form action={addToCartAction} className="flex-1">
              <input type="hidden" name="variantId" value={defaultVariant?.id || ""} />
              <Button type="submit" size="lg" className="w-full text-lg h-14 rounded-xl" disabled={!defaultVariant}>
                <ShoppingBag className="mr-2 h-5 w-5" />
                {defaultVariant ? "Add to Cart" : "Out of Stock"}
              </Button>
            </form>
            
            <form action={toggleWishlistAction}>
              <Button type="submit" variant="outline" size="icon" className="h-14 w-14 rounded-xl">
                <Heart className="h-5 w-5" />
                <span className="sr-only">Wishlist</span>
              </Button>
            </form>
          </div>
          
          <div className="text-sm text-muted-foreground mt-4">
            Sold by: <span className="font-medium text-foreground">{product.store.name}</span>
          </div>
        </div>
      </div>

      {formattedRelated.length > 0 && (
        <section className="pt-8 border-t border-border/40">
          <ProductCarousel title="You might also like" products={formattedRelated} />
        </section>
      )}
    </main>
  )
}
