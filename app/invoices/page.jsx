"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import {
  deleteInvoice,
  getInvoices,
  updateInvoiceStatus,
} from "../../services/invoiceService";
import { formatCurrency, formatDate } from "../../lib/utils";
import AppLayout from "../../components/AppLayout";
import ConfirmDialog from "../../components/ConfirmDialog";
import styles from "./page.module.scss";

const PAGE_SIZE = 25;

export default function InvoicesPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    if (user) {
      fetchInvoices();
    }
  }, [user]);

  async function fetchInvoices() {
    setLoading(true);

    try {
      const data = await getInvoices(user.uid, { limitCount: PAGE_SIZE });
      setInvoices(data);
      setHasMore(data.length === PAGE_SIZE);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadMore() {
    const last = invoices[invoices.length - 1];
    if (!last?.createdAt) {
      setHasMore(false);
      return;
    }

    setLoadingMore(true);

    try {
      const data = await getInvoices(user.uid, {
        limitCount: PAGE_SIZE,
        startAfterValue: last.createdAt,
      });

      setInvoices((prev) => [...prev, ...data]);
      setHasMore(data.length === PAGE_SIZE);
    } catch (error) {
      console.error("Error loading more invoices:", error);
    } finally {
      setLoadingMore(false);
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

  async function confirmDeleteInvoice() {
    if (!invoiceToDelete) return;

    setDeleteError("");
    setDeleting(true);

    try {
      await deleteInvoice(user.uid, invoiceToDelete.id);
      setInvoices((prev) =>
        prev.filter((inv) => inv.id !== invoiceToDelete.id),
      );
      setInvoiceToDelete(null);
    } catch (error) {
      console.error("Error deleting invoice:", error);
      setDeleteError("Could not delete this invoice. Please try again.");
    } finally {
      setDeleting(false);
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
        {loading ? (
          <div className={styles.loadingState}>Loading invoices...</div>
        ) : invoices.length === 0 ? (
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
                  <th />
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
                    <td>
                      <button
                        type="button"
                        className={styles.deleteBtn}
                        onClick={() => {
                          setInvoiceToDelete(inv);
                          setDeleteError("");
                        }}
                        aria-label={`Delete invoice ${inv.invoiceNumber}`}
                        title="Delete invoice"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && hasMore && (
          <div className={styles.loadMoreWrap}>
            <button
              type="button"
              className={styles.loadMoreBtn}
              onClick={loadMore}
              disabled={loadingMore}
            >
              {loadingMore ? "Loading..." : "Load More"}
            </button>
          </div>
        )}

        <ConfirmDialog
          open={Boolean(invoiceToDelete)}
          title="Delete this invoice?"
          message="The invoice will be removed from your records, and from your dashboard totals and receipts if it was marked paid."
          itemLabel={
            invoiceToDelete
              ? `${invoiceToDelete.invoiceNumber} — ${invoiceToDelete.clientName} (${formatCurrency(
                  invoiceToDelete.total,
                  invoiceToDelete.currency,
                )})`
              : ""
          }
          warning="This action is permanent and cannot be undone."
          confirmLabel="Delete Invoice"
          loading={deleting}
          error={deleteError}
          onConfirm={confirmDeleteInvoice}
          onCancel={() => {
            if (deleting) return;
            setInvoiceToDelete(null);
            setDeleteError("");
          }}
        />
      </div>
    </AppLayout>
  );
}
