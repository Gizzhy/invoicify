# Vendor Invoice App (Next.js App Router)

## Overview

A production-grade vendor invoice application built with Next.js App Router using JavaScript (.jsx) and SCSS.

Features:

- Signup/login with NextAuth credentials
- Protected dashboard
- Vendor profile with logo upload and bank accounts management
- Invoice creation with dynamic items, total calculation, currency and bank selection
- Invoice list and detail views
- Generate downloadable PDF invoices
- Prisma + SQLite persistence

## Setup

1. Copy `.env.example` to `.env` and update values:
   - `DATABASE_URL="file:./dev.db"`
   - `NEXTAUTH_SECRET` random string
   - `NEXTAUTH_URL=http://localhost:3000`

2. Install dependencies:

```bash
npm install
```

3. Initialize Prisma:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

4. Run the app:

```bash
npm run dev
```

## Directory structure

- `app/`
  - `page.js`, `dashboard`, `profile`, `invoices`, `login`, `signup`
  - `api/`: `auth`, `profile`, `bank-accounts`, `invoices`, `pdf`
- `components/`: `Layout`, `Providers`
- `lib/`: `prisma`, `utils`
- `prisma/schema.prisma`

## Notes

- Authentication uses NextAuth with Credentials provider.
- `logoPath` is stored as Base64 data URL for simplicity.
- PDF generation uses `pdfkit`.
- Invoice numbers are unique using random and timestamp hybrid.
