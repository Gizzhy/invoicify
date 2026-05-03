"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getInvoices } from "../../services/invoiceService";
import { getBankAccounts } from "../../services/vendorService";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ invoices: 0, accounts: 0 });

  useEffect(() => {
    if (!loading && !user) router.push("/login");
    if (user) {
      async function fetchStats() {
        try {
          const invoices = await getInvoices(user.uid);
          const accounts = await getBankAccounts(user.uid);
          setStats({
            invoices: invoices.length,
            accounts: accounts.length,
          });
        } catch (error) {
          console.error("Error fetching stats:", error);
        }
      }
      fetchStats();
    }
  }, [user, loading, router]);

  if (loading) return <div className="container card">Loading...</div>;

  return (
    <div className="container" style={{ marginTop: "2rem" }}>
      <div className="card">
        <h1>Dashboard</h1>
        <p>Welcome back, {user?.email}.</p>
        <div className="grid grid-2" style={{ gap: "1rem", marginTop: "1rem" }}>
          <div className="card">Invoices: {stats.invoices}</div>
          <div className="card">Bank accounts: {stats.accounts}</div>
        </div>
        <div style={{ marginTop: "1rem" }}>
          <Link href="/invoices">
            <button className="button">View Invoices</button>
          </Link>
          <Link href="/invoices/create" style={{ marginLeft: "0.8rem" }}>
            <button className="button">Create New Invoice</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
