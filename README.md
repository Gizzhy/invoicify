# Invoicify

A vendor invoicing app built with Next.js (App Router), JavaScript (`.jsx`) and SCSS modules, backed by Firebase.

Vendors sign up, set up their brand profile and payout accounts, then create, track and download invoices and receipts in multiple currencies.

## Features

- Email/password signup and login via Firebase Authentication
- Client-side protected app routes (dashboard, invoices, receipts, bank accounts, profile)
- Brand profile with logo upload to Firebase Storage
- Bank account management (add and delete payout accounts)
- Invoice creation with dynamic line items, live totals, currency selection (NGN, GBP, USD, EUR) and a payout account
- Invoice list and detail views, with a pending/paid status toggle and delete
- Receipts generated automatically when an invoice is marked paid
- Downloadable PDF invoices and receipts, generated in the browser with jsPDF
- Public landing, privacy, terms and account-deletion pages

## Tech stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 14 (App Router) |
| Language | JavaScript (`.jsx`) |
| Styling | SCSS modules |
| Auth | Firebase Authentication (email/password) |
| Database | Cloud Firestore |
| File storage | Firebase Storage (brand logos) |
| PDFs | `jspdf` + `jspdf-autotable` (client-side) |
| Icons | `lucide-react` |

There is no backend or API layer in this repo — every page is a client component talking to Firebase directly.

## Setup

1. Create a Firebase project with Authentication (Email/Password provider), Cloud Firestore and Storage enabled.

2. Add a `.env.local` in the project root with your Firebase web config:

   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
   NEXT_PUBLIC_FIREBASE_APP_ID=
   ```

3. Install dependencies and run the dev server:

   ```bash
   npm install
   npm run dev
   ```

   The app runs at http://localhost:3000.

Other scripts: `npm run build`, `npm run start`, `npm run lint`.

## Firestore data model

Everything is scoped under the signed-in user's document:

```
users/{uid}
  email, name, createdAt
  brandName, brandDesc, address, phone, logoUrl

users/{uid}/bankAccounts/{accountId}
  bankName, accountName, accountNumber, createdAt

users/{uid}/invoices/{invoiceId}
  invoiceNumber, clientName, clientPhone, currency,
  bankAccountId, items[{ name, quantity, price }], total,
  status: "pending" | "paid", createdAt,
  paidAt, receiptNumber   // set when the invoice is marked paid
```

Brand logos are stored in Firebase Storage at `users/{uid}/profile/logo-{timestamp}`.

Because all reads and writes happen from the browser, access control lives in your Firebase security rules: scope both Firestore and Storage rules so a user can only touch documents and files under their own `uid`. Route protection in the app (`components/AppLayout.jsx`) is a UX convenience, not a security boundary.

## Directory structure

```
app/
  page.js                    public landing page
  login/, signup/            auth screens
  dashboard/                 revenue, invoice and account summary
  invoices/                  list, create/, [id]/ detail
  receipts/                  receipts for paid invoices
  bank-accounts/             payout accounts
  profile/                   brand profile settings
  privacy/, terms/, delete-account/   static legal pages
  layout.js, globals.scss
components/
  AppLayout.jsx              auth guard + app shell
  AppSidebar.jsx             app navigation
  ConfirmDialog.jsx          shared destructive-action confirmation
  Providers.jsx              wraps the app in AuthProvider
context/
  AuthContext.jsx            exposes { user, loading }
lib/
  firebase.js                Firebase app, auth, db, storage
  utils.js                   currency/date formatting, totals, number generation
  generateInvoicePdf.js      invoice PDF
  generateReceiptPdf.js      receipt PDF
services/
  authService.js             signup, login, logout, auth state
  vendorService.js           profile, logo upload, bank accounts
  invoiceService.js          invoice CRUD and status changes
public/
```

## Notes

- Invoice and receipt numbers are generated client-side as `INV-{timestamp}-{random}` / `RCT-{timestamp}-{random}`; they are unique in practice but not enforced as unique by the database.
- A receipt number is minted the first time an invoice moves to `paid`, and is kept if the status changes again.
- Deleting an invoice is permanent and also removes its receipt from the receipts page.
- The bank account list on the bank accounts page is a hardcoded list of Nigerian banks in `app/bank-accounts/page.jsx`.
- PDF generation runs in the browser, so logo images must be served with permissive CORS headers to be drawn into the PDF; if a logo cannot be loaded the PDF is still produced without it.
