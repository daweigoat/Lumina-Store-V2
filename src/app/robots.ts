import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/seller/',
        '/checkout/',
        '/api/',
      ],
    },
    sitemap: 'https://luminastore.com/sitemap.xml',
  }
}
