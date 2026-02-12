# Deployment Guide

## 1. Vercel Deployment

1.  Push your code to the GitHub repository: `https://github.com/doctorboyz/fam-mee`.
2.  Log in to [Vercel](https://vercel.com).
3.  Click **Add New...** -> **Project**.
4.  Import the `fam-mee` repository.
5.  Configure the **Environment Variables**:
    - `DATABASE_URL`: Your Supabase connection string.
    - `NEXTAUTH_SECRET`: Generate a secret (e.g., `openssl rand -base64 32`).
    - `NEXTAUTH_URL`: Your Vercel deployment URL (e.g., `https://fam-mee.vercel.app`).
6.  Click **Deploy**.

## 2. Docker Deployment

### Build the Image

```bash
docker build -t fam-mee .
```

### Run the Container

```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:password@host:port/db" \
  -e NEXTAUTH_SECRET="your_secret" \
  -e NEXTAUTH_URL="http://localhost:3000" \
  fam-mee
```

## 3. Database Connection

### Local Development

- **Configuration**: Uses `.env` (default/production) and `.env.local` (local overrides).
- **Connection String**: `DATABASE_URL="postgresql://[user]:[password]@[host]:[port]/[db]"`
- **Prisma Config**: `prisma.config.ts` is configured to load `.env` first, then override with `.env.local`.
- **Recommendation**: Use `.env.local` for your local database credentials to avoid committing them.
- **Troubleshooting**:
  - Ensure `.env.local` does NOT contain a conflicting `DATABASE_URL` (especially one with placeholders).
  - Run `npx prisma db push` to sync schema changes.

### Vercel Deployment

- **Configuration**: Uses Environment Variables set in Vercel Project Settings.
- **Connection String**: Same format as local, pointing to your Supabase instance.
  - Ensure you check "Automatically expose System Environment Variables" or manually add `DATABASE_URL`.
- **Build**: Vercel automatically runs `prisma generate` during build (defined in `package.json` postinstall).

### Supabase Details

- **Host**: `aws-0-ap-southeast-1.pooler.supabase.com` (Example)
- **Port**: `6543` (Transaction Pooler - Recommended for Serverless/Edge) or `5432` (Direct).
- **Mode**: `Transaction` mode is recommended for Next.js deployed on Vercel.
