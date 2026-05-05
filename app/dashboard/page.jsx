"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import { getInvoices } from "../../services/invoiceService";
import { getBankAccounts } from "../../services/vendorService";
import AppLayout from "../../components/AppLayout";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ invoices: 0, accounts: 0 });

  useEffect(() => {
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
  }, [user]);

  return (
    <AppLayout>
      <div className="container" style={{ marginTop: "0" }}>
        <div className="card">
          <h1>Dashboard</h1>
          <p>Welcome back, {user?.email}.</p>
          <div
            className="grid grid-2"
            style={{ gap: "1rem", marginTop: "1rem" }}
          >
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
    </AppLayout>
  );
}
