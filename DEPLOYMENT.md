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

## 3. Database (Supabase)

1.  Go to your Supabase project settings.
2.  Get the connection string from **Database** -> **Connection string** -> **Node.js**.
3.  Use this string as the `DATABASE_URL` environment variable.
