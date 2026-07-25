import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import { ProductCarousel } from "@/features/storefront/components/products/product-carousel"
import { CategoryCard } from "@/features/storefront/components/products/category-card"
import { BrandCard } from "@/features/storefront/components/products/brand-card"
import { Skeleton } from "@/components/ui/skeleton"

export const dynamic = "force-dynamic"

async function FeaturedProducts() {
  const products = await prisma.product.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: { brand: true, reviews: { select: { rating: true } } },
  })

  const formattedProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    salePrice: p.salePrice,
    image: p.images[0] || "/placeholder.jpg",
    rating:
      p.reviews.length > 0
        ? p.reviews.reduce((acc, rev) => acc + rev.rating, 0) / p.reviews.length
        : 0,
    reviewsCount: p.reviews.length,
    brand: p.brand?.name,
  }))

  return <ProductCarousel title="New Arrivals" products={formattedProducts} />
}

async function Categories() {
  const categories = await prisma.category.findMany({
    take: 6,
    orderBy: { products: { _count: "desc" } },
  })

  if (!categories.length) return null

  return (
    <section className="py-12">
      <h2 className="text-2xl font-heading font-bold mb-6">Shop by Category</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((c) => (
          <CategoryCard key={c.id} name={c.name} slug={c.slug} image={c.image || ""} />
        ))}
      </div>
    </section>
  )
}

async function Brands() {
  const brands = await prisma.brand.findMany({
    take: 6,
    orderBy: { products: { _count: "desc" } },
  })

  if (!brands.length) return null

  return (
    <section className="py-12">
      <h2 className="text-2xl font-heading font-bold mb-6">Popular Brands</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {brands.map((b) => (
          <BrandCard key={b.id} name={b.name} slug={b.slug} logo={b.logo || ""} />
        ))}
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8 space-y-16">
      {/* Hero Banner Placeholder */}
      <div className="w-full h-[400px] bg-muted/30 rounded-2xl flex items-center justify-center border border-border/40">
        <h1 className="text-4xl md:text-6xl font-heading font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
          Welcome to LuminaStore
        </h1>
      </div>

      <Suspense fallback={<Skeleton className="w-full h-[400px]" />}>
        <FeaturedProducts />
      </Suspense>

      <Suspense fallback={<Skeleton className="w-full h-[200px]" />}>
        <Categories />
      </Suspense>

      <Suspense fallback={<Skeleton className="w-full h-[200px]" />}>
        <Brands />
      </Suspense>
    </main>
  )
}
