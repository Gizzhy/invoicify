"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { logout } from "../services/authService";

export default function Layout({ children }) {
  const { user, loading } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <header
        style={{ background: "#0b4a82", color: "white", padding: "1rem 0" }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Link href="/dashboard">
            <strong>Invoice Vendor</strong>
          </Link>
          <nav style={{ display: "flex", gap: "0.8rem" }}>
            {user ? (
              <>
                <Link href="/dashboard">Dashboard</Link>
                <Link href="/profile">Profile</Link>
                <Link href="/invoices">Invoices</Link>
                <button
                  className="button"
                  style={{ padding: ".5rem .8rem" }}
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login">Login</Link>
                <Link href="/signup">Sign up</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <div>{children}</div>
    </div>
  );
}
