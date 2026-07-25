import { prisma } from "@/lib/prisma"
import { ProductGrid } from "@/features/storefront/components/products/product-grid"

export const dynamic = "force-dynamic"

export default async function SearchPage(
  props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }
) {
  const searchParams = await props.searchParams
  const q = typeof searchParams.q === "string" ? searchParams.q : undefined
  const category = typeof searchParams.category === "string" ? searchParams.category : undefined

  // Avoid N+1 by fetching everything in one go with include
  const products = await prisma.product.findMany({
    where: {
      ...(q ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ]
      } : {}),
      ...(category ? { category: { slug: category } } : {})
    },
    include: {
      brand: true,
      reviews: { select: { rating: true } }
    },
    take: 24, // limit
  })

  const formattedProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    salePrice: p.salePrice,
    image: p.images[0] || "/placeholder.jpg",
    rating: p.reviews.length > 0
        ? p.reviews.reduce((acc, rev) => acc + rev.rating, 0) / p.reviews.length
        : 0,
    reviewsCount: p.reviews.length,
    brand: p.brand?.name,
  }))

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold mb-2">
          {q ? `Search results for "${q}"` : "All Products"}
        </h1>
        <p className="text-muted-foreground">
          Showing {formattedProducts.length} products
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar (Stub) */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-6">
          <div className="rounded-xl border border-border/40 p-4">
            <h3 className="font-semibold mb-4">Categories</h3>
            <p className="text-sm text-muted-foreground">Filter UI placeholder</p>
          </div>
          <div className="rounded-xl border border-border/40 p-4">
            <h3 className="font-semibold mb-4">Price Range</h3>
            <p className="text-sm text-muted-foreground">Filter UI placeholder</p>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1">
          {formattedProducts.length > 0 ? (
            <ProductGrid products={formattedProducts} />
          ) : (
            <div className="text-center py-20 bg-muted/20 rounded-xl border border-border/40">
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
