import Link from "next/link";
import { PlayCircle } from "lucide-react";
import styles from "./home.module.scss";

export default function Home() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.content}>
          <h1>
            Professional Invoicing for <span>Modern Vendors</span>
          </h1>

          <p>
            Create professional invoices in seconds, manage multi-currency
            payments, and track every transaction all in one simple, powerful
            dashboard.
          </p>

          <div className={styles.actions}>
            <Link href="/login" className={styles.primaryBtn}>
              Log In
            </Link>

            <Link href="/signup" className={styles.secondaryBtn}>
              Sign Up
            </Link>
          </div>
        </div>

        <div className={styles.visual}>
          <div className={styles.mockup}>
            <div className={styles.screen}>
              <div className={styles.chart}>
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>

              <div className={styles.invoiceCard}>
                <div />
                <div />
                <div />
                <strong />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.trusted}>
        TRUSTED BY 10K+ FREELANCERS AND AGENCIES WORLDWIDE
      </section>
    </main>
  );
}
