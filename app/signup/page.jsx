"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Eye, FileText, ShieldCheck, Star } from "lucide-react";
import { signup } from "../../services/authService";
import styles from "./signup.module.scss";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);

    try {
      await signup(form.email, form.password, form.name);
      router.push("/login");
    } catch (error) {
      setError(error.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.pageWrap}>
      <section className={styles.leftPanel}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <FileText size={22} />
          </div>
          <span>Invoicify</span>
        </div>

        <div className={styles.hero}>
          <h1>Professional Invoicing for Modern Vendors</h1>
          <p>
            Join thousands of freelancers and agencies simplifying their
            finances with automated PDF generation and profile management.
          </p>

          <div className={styles.trustCard}>
            <div className={styles.avatars}>
              <span>👩🏻</span>
              <span>👩🏽</span>
              <span>👨🏾</span>
            </div>

            <div>
              <div className={styles.stars}>
                {[1, 2, 3, 4, 5].map((item) => (
                  <Star key={item} size={14} fill="currentColor" />
                ))}
              </div>
              <p>Trusted by 10k+ vendors</p>
            </div>
          </div>
        </div>

        <div className={styles.security}>
          <ShieldCheck size={16} />
          <span>Bank-grade security</span>
        </div>
      </section>

      <section className={styles.rightPanel}>
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h2>Get Started</h2>
            <p>
              Create your free account today and start invoicing in minutes.
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <input
              className={styles.input}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Name"
            />

            <input
              className={styles.input}
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Email Address"
            />

            <div className={styles.passwordWrap}>
              <input
                className={styles.input}
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Password"
              />
              <button
                type="button"
                className={styles.eyeButton}
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((prev) => !prev)}
              >
                <Eye size={18} />
              </button>
            </div>

            <label className={styles.terms}>
              <input type="checkbox" />
              <span>
                I agree to the <Link href="/">Terms of Service</Link> and{" "}
                <Link href="/">Privacy Policy</Link>.
              </span>
            </label>

            {error && <div className={styles.error}>{error}</div>}

            <button disabled={loading} type="submit" className={styles.button}>
              <span>{loading ? "Creating..." : "Create Account"}</span>
              {!loading && <ArrowRight size={19} />}
            </button>
          </form>

          <p className={styles.loginText}>
            Already have an account? <Link href="/login">Login</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
