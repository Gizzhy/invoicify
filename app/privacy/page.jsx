import Link from "next/link";
import styles from "./privacy.module.scss";

export const metadata = {
  title: "Privacy Policy — Invoicify",
  description:
    "How Invoicify, operated by Codesystic, collects and protects your data.",
};

export default function PrivacyPolicy() {
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
        <h1 className={styles.title}>Privacy Policy</h1>
        <p className={styles.subtitle}>Invoicify, operated by Codesystic</p>
        <p className={styles.updated}>Last updated: 17 June 2026</p>

        <p className={styles.intro}>
          This Privacy Policy explains how Codesystic (&quot;we&quot;, &quot;us&quot;,
          &quot;our&quot;) collects, uses, and protects your information when you use the
          Invoicify mobile application (&quot;the App&quot;). By using the App, you agree to
          the practices described here.
        </p>

        <Section title="1. Who we are">
          <p>
            The App is provided by Codesystic. If you have any questions about this policy or
            your data, contact us at{" "}
            <a href="mailto:contact@invoicify.store">contact@invoicify.store</a>.
          </p>
        </Section>

        <Section title="2. Information we collect">
          <h3>Information you provide</h3>
          <ul>
            <li>
              <strong>Account information:</strong> your email address and the name you
              register with, used to create and secure your account.
            </li>
            <li>
              <strong>Business profile:</strong> your brand name, business description,
              address, phone number, and logo image, which appear on the invoices you generate.
            </li>
            <li>
              <strong>Bank account details:</strong> bank name, account name, and account
              number that you choose to save, so they can be displayed on your invoices as
              payment information. These are stored to provide the App&apos;s core function and
              are not used for any other purpose.
            </li>
            <li>
              <strong>Invoice and client data:</strong> information you enter to create
              invoices, including your clients&apos; names and phone numbers, item descriptions,
              amounts, and currency.
            </li>
          </ul>

          <h3>Information collected automatically</h3>
          <ul>
            <li>
              <strong>Advertising identifiers and usage data:</strong> when ads are shown, our
              advertising provider (Google AdMob) may collect a device advertising identifier
              and related technical information to deliver and measure ads. See section 4.
            </li>
            <li>
              <strong>Diagnostic information:</strong> our service providers may collect limited
              technical data (such as crash and performance information) to keep the App working
              reliably.
            </li>
          </ul>
        </Section>

        <Section title="3. How we use your information">
          <ul>
            <li>To create and manage your account and authenticate you.</li>
            <li>To generate, store, and let you share your invoices and receipts.</li>
            <li>To display your business and payment details on the documents you create.</li>
            <li>To show advertising that helps keep the App free (see section 4).</li>
            <li>To maintain, secure, and improve the App.</li>
          </ul>
        </Section>

        <Section title="4. Advertising">
          <p>
            The App displays advertisements through <strong>Google AdMob</strong>. AdMob may use
            device identifiers and related data to serve and measure ads, including, where
            permitted, personalized ads. You can learn how Google uses data from apps that use
            its services at{" "}
            <a
              href="https://policies.google.com/technologies/partner-sites"
              target="_blank"
              rel="noopener noreferrer"
            >
              policies.google.com/technologies/partner-sites
            </a>
            .
          </p>
          <p>
            If you are located in the European Economic Area, the United Kingdom, or
            Switzerland, you will be asked for consent regarding personalized advertising before
            such ads are shown, in line with applicable law. You can change your choice at any
            time through the consent options available in the App.
          </p>
        </Section>

        <Section title="5. How your information is stored and shared">
          <p>
            We use trusted third-party service providers to operate the App. Your data is
            processed and stored on their infrastructure:
          </p>
          <ul>
            <li>
              <strong>Google Firebase</strong> (authentication, database, and file storage) —
              stores your account, profile, bank details, invoices, and uploaded logo. See{" "}
              <a
                href="https://firebase.google.com/support/privacy"
                target="_blank"
                rel="noopener noreferrer"
              >
                Firebase Privacy
              </a>
              .
            </li>
            <li>
              <strong>Google AdMob</strong> (advertising) — see{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Privacy Policy
              </a>
              .
            </li>
          </ul>
          <p>
            We do <strong>not</strong> sell your personal information. We do not share your data
            with third parties except the service providers above, or where required by law.
          </p>
        </Section>

        <Section title="6. Data retention">
          <p>
            We keep your information for as long as your account is active. When you delete a
            piece of data (such as a bank account or invoice) within the App, it is removed from
            our active database. If you wish to delete your account and associated data
            entirely, contact us at{" "}
            <a href="mailto:contact@invoicify.store">contact@invoicify.store</a>.
          </p>
        </Section>

        <Section title="7. Your rights">
          <p>
            Depending on where you live, you may have rights to access, correct, export, or
            delete your personal data, and to object to or restrict certain processing. To
            exercise any of these rights, contact us at{" "}
            <a href="mailto:contact@invoicify.store">contact@invoicify.store</a>. If you are in
            the European Economic Area or the United Kingdom, you also have the right to lodge a
            complaint with your local data protection authority.
          </p>
        </Section>

        <Section title="8. Security">
          <p>
            We take reasonable technical and organizational measures to protect your
            information, and rely on the security infrastructure of our service providers.
            However, no method of transmission or storage is completely secure, and we cannot
            guarantee absolute security.
          </p>
        </Section>

        <Section title="9. Children's privacy">
          <p>
            The App is intended for business and professional use and is not directed at
            children under the age of 16. We do not knowingly collect personal information from
            children. If you believe a child has provided us with personal data, contact us and
            we will delete it.
          </p>
        </Section>

        <Section title="10. Changes to this policy">
          <p>
            We may update this Privacy Policy from time to time. When we do, we will revise the
            &quot;Last updated&quot; date above. Significant changes may be communicated within
            the App.
          </p>
        </Section>

        <Section title="11. Contact">
          <p>For any questions or requests regarding this policy or your personal data, contact:</p>
          <p>
            <strong>Codesystic</strong>
            <br />
            Email:{" "}
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
