"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Eye,
  FileText,
  WalletCards,
} from "lucide-react";
import { login } from "../../services/authService";
import styles from "./page.module.scss";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <main className={styles.pageWrap}>
      <section className={styles.leftPanel}>
        <div className={styles.glowOne} />
        <div className={styles.glowTwo} />

        <div className={styles.leftContent}>
          <div className={styles.brand}>
            <div className={styles.logo}>
              <WalletCards size={24} />
            </div>
            <span>Invoicify</span>
          </div>

          <div className={styles.featureCards}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <FileText size={22} />
              </div>
              <div>
                <h4>Invoicing</h4>
                <p>Automated & fast</p>
              </div>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <BarChart3 size={22} />
              </div>
              <div>
                <h4>Reports</h4>
                <p>Real-time data</p>
              </div>
            </div>
          </div>

          <div className={styles.heroText}>
            <h1>Manage your business invoices with ease</h1>
            <p>
              Streamline your cash flow, track payments, and get paid faster
              with professional tools built for modern vendors.
            </p>
          </div>
        </div>

        <div className={styles.leftFooter}>
          <span>© 2026 Invoicify Inc.</span>
          <div>
            <Link href="/">Privacy</Link>
            <Link href="/">Terms</Link>
          </div>
        </div>
      </section>

      <section className={styles.rightPanel}>
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h2>Welcome back</h2>
            <p>Please enter your details to sign in.</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <input
                className={styles.input}
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Email address"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <input
                className={`${styles.input} ${styles.passwordInput}`}
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Password"
                required
              />
              <button
                className={styles.eyeButton}
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((prev) => !prev)}
              >
                <Eye size={20} />
              </button>
            </div>

            <div className={styles.formOptions}>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" />
                <span>Remember me</span>
              </label>

              <Link href="/" className={styles.forgotLink}>
                Forgot password?
              </Link>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <button disabled={loading} className={styles.button} type="submit">
              <span>{loading ? "Signing in..." : "Sign in"}</span>
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>

          <div className={styles.bottomText}>
            Don&apos;t have an account?{" "}
            <Link href="/signup">Sign up for free</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
