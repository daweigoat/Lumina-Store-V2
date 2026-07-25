import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch active products
  const products = await prisma.product.findMany({
    where: { status: 'APPROVED' },
    select: { slug: true, updatedAt: true }
  })

  const productUrls = products.map((product) => ({
    url: `https://luminastore.com/product/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  return [
    {
      url: 'https://luminastore.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://luminastore.com/search',
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    ...productUrls,
  ]
}
