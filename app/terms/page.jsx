import Link from "next/link";
import styles from "../privacy/privacy.module.scss";

export const metadata = {
  title: "Terms of Service — Invoicify",
  description:
    "The terms governing your use of the Invoicify mobile application, operated by Codesystic.",
};

export default function TermsOfService() {
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
        <h1 className={styles.title}>Terms of Service</h1>
        <p className={styles.subtitle}>Invoicify, operated by Codesystic</p>
        <p className={styles.updated}>Last updated: 21 June 2026</p>

        <p className={styles.intro}>
          These Terms of Service (&quot;Terms&quot;) govern your use of the Invoicify mobile
          application (&quot;the App&quot;), operated by Codesystic (&quot;we&quot;, &quot;us&quot;,
          &quot;our&quot;). By downloading, accessing, or using the App, you agree to these Terms.
          If you do not agree, do not use the App.
        </p>

        <Section title="1. Use of the App">
          <p>
            Invoicify lets users create, manage, and share invoices and receipts for their own
            business purposes. You must be at least 18 years old to use the App. You are
            responsible for the accuracy of the information you enter, including your business
            details, bank account information, and client information.
          </p>
        </Section>

        <Section title="2. Your Account">
          <p>
            You are responsible for maintaining the confidentiality of your account credentials
            and for all activity under your account. Notify us at{" "}
            <a href="mailto:contact@invoicify.store">contact@invoicify.store</a> of any
            unauthorized use.
          </p>
        </Section>

        <Section title="3. Your Content and Data">
          <p>
            You retain ownership of the content you create (invoices, business profile, client
            details). You are solely responsible for ensuring you have the right to use any
            information you enter, including client data. You are responsible for the accuracy of
            bank account and payment details shown on your invoices.
          </p>
        </Section>

        <Section title="4. Acceptable Use">
          <p>
            You agree not to use the App for any unlawful, fraudulent, or abusive purpose,
            including creating fraudulent invoices, misrepresenting payment details, or violating
            the rights of others.
          </p>
        </Section>

        <Section title="5. Payments Between Users and Their Clients">
          <p>
            Invoicify is a tool for generating invoices and receipts. We do not process, hold, or
            transfer any payments. Any payment between you and your clients happens directly
            between those parties, outside the App. We are not responsible for any transaction,
            dispute, or loss arising from payments.
          </p>
        </Section>

        <Section title="6. Advertising">
          <p>
            The App is supported by advertising provided through third-party networks. By using
            the App you acknowledge that ads may be displayed.
          </p>
        </Section>

        <Section title="7. Disclaimer of Warranties">
          <p>
            The App is provided &quot;as is&quot; and &quot;as available&quot; without warranties
            of any kind. We do not guarantee the App will be uninterrupted, error-free, or that
            data will always be available.
          </p>
        </Section>

        <Section title="8. Limitation of Liability">
          <p>
            To the maximum extent permitted by law, Codesystic shall not be liable for any
            indirect, incidental, or consequential damages, or any loss of data, revenue, or
            profits, arising from your use of the App.
          </p>
        </Section>

        <Section title="9. Termination">
          <p>
            We may suspend or terminate your access to the App if you violate these Terms. You may
            stop using the App and request account deletion at any time (see our{" "}
            <Link href="/delete-account">account deletion page</Link>).
          </p>
        </Section>

        <Section title="10. Changes to These Terms">
          <p>
            We may update these Terms from time to time. Continued use of the App after changes
            means you accept the updated Terms.
          </p>
        </Section>

        <Section title="11. Governing Law">
          <p>
            These Terms are governed by applicable law. Nothing in these Terms limits any
            non-waivable statutory rights you may have as a consumer.
          </p>
        </Section>

        <Section title="12. Contact">
          <p>
            For questions about these Terms, contact us at{" "}
            <a href="mailto:contact@invoicify.store">contact@invoicify.store</a>.
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
