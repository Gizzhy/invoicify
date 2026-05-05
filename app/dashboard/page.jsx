"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Banknote,
  FileText,
  Landmark,
  Plus,
  ReceiptText,
  WalletCards,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getInvoices } from "../../services/invoiceService";
import { getBankAccounts } from "../../services/vendorService";
import { formatCurrency, formatDate } from "../../lib/utils";
import AppLayout from "../../components/AppLayout";
import styles from "./dashboard.module.scss";

export default function DashboardPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  async function fetchDashboardData() {
    try {
      const invoicesData = await getInvoices(user.uid);
      const accountsData = await getBankAccounts(user.uid);

      setInvoices(invoicesData);
      setAccounts(accountsData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  }

  const groupedTotals = useMemo(() => {
    const revenue = {};
    const pending = {};

    invoices.forEach((invoice) => {
      const currency = invoice.currency || "NGN";
      const total = Number(invoice.total || 0);

      revenue[currency] = (revenue[currency] || 0) + total;

      if ((invoice.status || "pending") === "pending") {
        pending[currency] = (pending[currency] || 0) + total;
      }
    });

    return { revenue, pending };
  }, [invoices]);

  const recentInvoices = invoices.slice(0, 5);

  function initials(name = "") {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  function renderMoneyList(data) {
    const entries = Object.entries(data);

    if (entries.length === 0) {
      return <strong className={styles.emptyMoney}>No data yet</strong>;
    }

    return (
      <div className={styles.moneyList}>
        {entries.map(([currency, amount]) => (
          <strong key={currency}>{formatCurrency(amount, currency)}</strong>
        ))}
      </div>
    );
  }

  return (
    <AppLayout>
      <main className={styles.page}>
        <header className={styles.header}>
          <div>
            <h1>Dashboard Overview</h1>
            <p>Here&apos;s what&apos;s happening with your account today.</p>
          </div>

          <Link href="/invoices/create" className={styles.createButton}>
            <Plus size={18} />
            Create New Invoice
          </Link>
        </header>

        <section className={styles.statsGrid}>
          <article className={styles.statCard}>
            <div className={styles.statTop}>
              <div className={`${styles.iconBox} ${styles.green}`}>
                <Banknote size={24} />
              </div>
            </div>
            <span>Total Revenue</span>
            {renderMoneyList(groupedTotals.revenue)}
          </article>

          <article className={styles.statCard}>
            <div className={styles.statTop}>
              <div className={`${styles.iconBox} ${styles.blue}`}>
                <ReceiptText size={24} />
              </div>
            </div>
            <span>Total Invoices Sent</span>
            <strong className={styles.bigNumber}>{invoices.length}</strong>
          </article>

          <article className={styles.statCard}>
            <div className={styles.statTop}>
              <div className={`${styles.iconBox} ${styles.orange}`}>
                <WalletCards size={24} />
              </div>
            </div>
            <span>Pending Payments</span>
            {renderMoneyList(groupedTotals.pending)}
          </article>

          <article className={styles.statCard}>
            <div className={styles.statTop}>
              <div className={`${styles.iconBox} ${styles.purple}`}>
                <Landmark size={24} />
              </div>
            </div>
            <span>Bank Accounts</span>
            <strong className={styles.bigNumber}>{accounts.length}</strong>
          </article>
        </section>

        <section className={styles.recentHeader}>
          <h2>Recent Invoices</h2>
          <Link href="/invoices">View All</Link>
        </section>

        <section className={styles.tableCard}>
          {recentInvoices.length === 0 ? (
            <div className={styles.emptyState}>
              <FileText size={34} />
              <h3>No invoices yet</h3>
              <p>Create your first invoice to start tracking revenue.</p>
              <Link href="/invoices/create">Create Invoice</Link>
            </div>
          ) : (
            <div className={styles.tableWrap}>
              <table>
                <thead>
                  <tr>
                    <th>Invoice ID</th>
                    <th>Client</th>
                    <th>Date Sent</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {recentInvoices.map((invoice) => {
                    const status = invoice.status || "pending";

                    return (
                      <tr key={invoice.id}>
                        <td>
                          <Link
                            href={`/invoices/${invoice.id}`}
                            className={styles.invoiceLink}
                          >
                            #{invoice.invoiceNumber}
                          </Link>
                        </td>

                        <td>
                          <div className={styles.clientCell}>
                            <span>{initials(invoice.clientName)}</span>
                            <strong>{invoice.clientName}</strong>
                          </div>
                        </td>

                        <td>{formatDate(invoice.createdAt)}</td>

                        <td>
                          {formatCurrency(invoice.total, invoice.currency)}
                        </td>

                        <td>
                          <span
                            className={`${styles.statusPill} ${
                              status === "paid" ? styles.paid : styles.pending
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </AppLayout>
  );
}
