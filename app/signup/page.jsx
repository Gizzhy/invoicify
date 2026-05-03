"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signup } from "../../services/authService";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    <div className="container card" style={{ marginTop: "3rem" }}>
      <h1>Create an account</h1>
      <form onSubmit={handleSubmit}>
        <label className="label">Name</label>
        <input
          className="input"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Your name"
        />

        <label className="label">Email</label>
        <input
          className="input"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="email@example.com"
        />

        <label className="label">Password</label>
        <input
          className="input"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="Password"
        />

        {error && <div className="error">{error}</div>}

        <button disabled={loading} type="submit" className="button">
          {loading ? "Creating..." : "Sign up"}
        </button>
      </form>
    </div>
  );
}
