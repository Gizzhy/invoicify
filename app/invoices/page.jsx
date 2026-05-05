"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import {
  getInvoices,
  updateInvoiceStatus,
} from "../../services/invoiceService";
import { formatCurrency, formatDate } from "../../lib/utils";
import AppLayout from "../../components/AppLayout";
import styles from "./page.module.scss";

export default function InvoicesPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    if (user) {
      fetchInvoices();
    }
  }, [user]);

  async function fetchInvoices() {
    try {
      const data = await getInvoices(user.uid);
      setInvoices(data);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  }

  async function handleStatusChange(invoiceId, newStatus) {
    try {
      await updateInvoiceStatus(user.uid, invoiceId, newStatus);
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === invoiceId ? { ...inv, status: newStatus } : inv,
        ),
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  }

  function getInitials(name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  return (
    <AppLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerText}>
            <h1>Invoices</h1>
            <p>Manage, track, and download your customer invoices.</p>
          </div>
          <Link href="/invoices/create">
            <button className={styles.createBtn}>Create New Invoice</button>
          </Link>
        </div>
        {invoices.length === 0 ? (
          <p>No invoices yet.</p>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Client</th>
                  <th>Date Sent</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td>
                      <Link
                        href={`/invoices/${inv.id}`}
                        className={styles.invoiceId}
                      >
                        {inv.invoiceNumber}
                      </Link>
                    </td>
                    <td>
                      <div className={styles.clientCell}>
                        <div className={styles.avatar}>
                          {getInitials(inv.clientName)}
                        </div>
                        {inv.clientName}
                      </div>
                    </td>
                    <td>{formatDate(inv.createdAt)}</td>
                    <td className={styles.amount}>
                      {formatCurrency(inv.total, inv.currency)}
                    </td>
                    <td>
                      <span
                        className={`${styles.statusPill} ${
                          inv.status === "paid"
                            ? styles.statusPaid
                            : styles.statusPending
                        }`}
                      >
                        {inv.status || "pending"}
                      </span>
                    </td>
                    <td>
                      <select
                        className={styles.statusSelect}
                        value={inv.status || "pending"}
                        onChange={(e) =>
                          handleStatusChange(inv.id, e.target.value)
                        }
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
