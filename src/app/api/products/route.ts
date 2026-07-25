import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const SearchQuerySchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  minRating: z.coerce.number().optional(),
  sort: z.enum(["newest", "price-asc", "price-desc", "rating"]).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(12),
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams)
    const query = SearchQuerySchema.safeParse(searchParams)

    if (!query.success) {
      return NextResponse.json({ error: "Invalid search parameters", details: query.error.format() }, { status: 400 })
    }

    const { q, category, brand, minPrice, maxPrice, sort, page, limit } = query.data

    const skip = (page - 1) * limit

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}

    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ]
    }

    if (category) {
      where.category = { slug: category }
    }

    if (brand) {
      where.brand = { slug: brand }
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {}
      if (minPrice !== undefined) where.price.gte = minPrice
      if (maxPrice !== undefined) where.price.lte = maxPrice
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let orderBy: any = { createdAt: 'desc' }
    if (sort === 'price-asc') orderBy = { price: 'asc' }
    if (sort === 'price-desc') orderBy = { price: 'desc' }
    if (sort === 'newest') orderBy = { createdAt: 'desc' }
    // Rating sort would require an aggregate query or caching average rating on Product model

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: true,
          brand: true,
          reviews: {
            select: { rating: true }
          }
        }
      }),
      prisma.product.count({ where })
    ])

    // Calculate ratings safely without N+1 (since we fetched them in the include)
    const productsWithRating = products.map(p => {
      const avgRating = p.reviews.length > 0 
        ? p.reviews.reduce((acc, rev) => acc + rev.rating, 0) / p.reviews.length 
        : 0
      return {
        ...p,
        rating: avgRating,
        reviewsCount: p.reviews.length
      }
    })

    // If sorting by rating, do it in memory since we didn't cache it on DB
    if (sort === 'rating') {
      productsWithRating.sort((a, b) => b.rating - a.rating)
    }

    return NextResponse.json({
      data: productsWithRating,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}

// POST is for Sellers/Admin to create products. (Stub for now)
export async function POST() {
  return NextResponse.json({ message: "Not implemented" }, { status: 501 })
}
