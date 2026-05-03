"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { login } from "../../services/authService";
import styles from "./page.module.scss";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      router.push("/dashboard");
    } catch (error) {
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.pageWrap}>
      <section className={styles.leftPanel}>
        <div>
          <div className={styles.brand}>
            <div className={styles.logo}>VI</div>
            <div className={styles.brandTitle}>VendorInvoice</div>
          </div>

          <div className={styles.featureCards}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📄</div>
              <div className={styles.featureDetails}>
                <div className={styles.featureTitle}>Invoicing</div>
                <div className={styles.featureSubtitle}>Automated & fast</div>
              </div>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📊</div>
              <div className={styles.featureDetails}>
                <div className={styles.featureTitle}>Reports</div>
                <div className={styles.featureSubtitle}>Real-time data</div>
              </div>
            </div>
          </div>

          <h1 className={styles.headline}>
            Manage your business invoices with ease
          </h1>
          <p className={styles.description}>
            Streamline your cash flow, track payments, and get paid faster with
            our professional financial tools designed for modern vendors.
          </p>
        </div>

        <div className={styles.leftFooter}>
          <span>© 2024 VendorInvoice Inc.</span>
          <Link href="/" className={styles.linkText}>
            Privacy
          </Link>
          <Link href="/" className={styles.linkText}>
            Terms
          </Link>
        </div>
      </section>

      <section className={styles.rightPanel}>
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h2>Welcome back</h2>
            <p>Please enter your details to sign in.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Email address</label>
              <input
                className={styles.input}
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Password</label>
              <input
                className={styles.input}
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Enter your password"
              />
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <button disabled={loading} className={styles.button} type="submit">
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className={styles.bottomText}>
            Don&apos;t have an account?{" "}
            <Link href="/signup">Sign up for free</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
