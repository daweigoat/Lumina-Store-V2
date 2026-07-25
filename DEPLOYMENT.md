# LuminaStore Production Deployment Guide

LuminaStore is optimized for deployment on Vercel with Neon PostgreSQL and Cloudflare R2.

## Prerequisites

1. **Vercel Account** - For hosting the Next.js application.
2. **Neon Account** - For Serverless PostgreSQL.
3. **Cloudflare Account** - For R2 Object Storage.
4. **Midtrans Account** - For Payment Gateway processing.
5. **Resend Account** - For Transactional Email.
6. **Sentry Account** - For Error Tracking (Optional but recommended).
7. **RajaOngkir Account** - For Shipping rates.

## Step 1: Database Setup (Neon)

1. Create a new project in [Neon](https://neon.tech).
2. Copy your connection string.
3. In your local `.env`, set `DATABASE_URL`.
4. Run `npx prisma db push` to initialize your schema.

## Step 2: Object Storage (Cloudflare R2)

1. Create a new bucket in Cloudflare R2 (e.g., `luminastore-assets`).
2. Generate an API token with "Object Read & Write" permissions.
3. Retrieve your Account ID, Access Key ID, and Secret Access Key.
4. Set CORS on the bucket to allow your Vercel domain.

## Step 3: Deployment on Vercel

1. Push your repository to GitHub.
2. Import the project into Vercel.
3. In the "Environment Variables" section, copy over the variables from your local `.env` (excluding mock settings).
4. Deploy the application!

## Step 4: Security Checklist

- [ ] Ensure `AUTH_SECRET` is a strong, randomly generated string.
- [ ] Disable all mock providers (`MOCK_PAYMENT=false`, etc.).
- [ ] Verify `NEXT_PUBLIC_APP_URL` matches your production domain.
- [ ] Confirm Sentry is capturing exceptions in production.

## Troubleshooting

- **Database Connection Issues**: Verify Neon IP allowlisting (if any).
- **Images not loading**: Verify Cloudflare R2 CORS and public domain setup.
- **Login fails**: Ensure GitHub/Google OAuth callbacks match your Vercel URL exactly (`https://<domain>/api/auth/callback/github`).
