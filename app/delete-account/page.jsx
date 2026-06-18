import Link from "next/link";
import styles from "../privacy/privacy.module.scss";

export const metadata = {
  title: "Account & Data Deletion — Invoicify",
  description:
    "How to request deletion of your Invoicify account and associated data.",
};

export default function DeleteAccount() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.brand}>
            Invoici<span>fy</span>
          </Link>
          <nav className={styles.nav}>
            <Link href="/">Home</Link>
            <Link href="/login">Log In</Link>
            <Link href="/signup">Sign Up</Link>
          </nav>
        </div>
      </header>

      <div className={styles.container}>
        <h1 className={styles.title}>Account &amp; Data Deletion</h1>
        <p className={styles.subtitle}>Invoicify, operated by Codesystic</p>

        <p className={styles.intro}>
          This page explains how to request deletion of your Invoicify account and associated
          data.
        </p>

        <Section title="How to request deletion">
          <p>
            To delete your Invoicify account and all associated data, send an email to{" "}
            <a href="mailto:contact@invoicify.store">contact@invoicify.store</a> from the email
            address associated with your account, with the subject &quot;Delete my account&quot;.
            We will process your request and permanently delete your account within 30 days.
          </p>
        </Section>

        <Section title="What data is deleted">
          <p>
            Upon your request, we permanently delete: your account and login credentials, your
            business/brand profile (name, description, address, phone, logo), your saved bank
            account details, and all invoices, receipts, and client information you created.
          </p>
        </Section>

        <Section title="What data is kept">
          <p>
            We do not retain personal data after deletion is complete. Limited records may be
            temporarily retained only where required by law, and are deleted once no longer
            required.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            <a href="mailto:contact@invoicify.store">contact@invoicify.store</a>
          </p>
        </Section>

        <footer className={styles.footer}>
          © 2026 Codesystic. All rights reserved.
        </footer>
      </div>
    </main>
  );
}

function Section({ title, children }) {
  return (
    <section className={styles.section}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
