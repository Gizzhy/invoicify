"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Banknote,
  Pencil,
  CalendarDays,
  Download,
  FileText,
  Phone,
  Trash2,
  UserRound,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { formatCurrency, formatDate } from "../../../lib/utils";
import {
  deleteInvoice,
  getInvoice,
  updateInvoiceStatus,
} from "../../../services/invoiceService";
import {
  getBankAccounts,
  getVendorProfile,
} from "../../../services/vendorService";
import { generateInvoicePdf } from "../../../lib/generateInvoicePdf";
import { generateReceiptPdf } from "../../../lib/generateReceiptPdf";
import AppLayout from "../../../components/AppLayout";
import ConfirmDialog from "../../../components/ConfirmDialog";
import styles from "./id.module.scss";

export default function InvoiceDetail() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();

  const [invoice, setInvoice] = useState(null);
  const [bankAccount, setBankAccount] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    if (user && params.id) fetchInvoice();
  }, [user, params.id]);

  async function fetchInvoice() {
    setLoadError("");

    try {
      // Only the invoice itself is critical: a missing bank account or
      // profile should still render the invoice rather than an error.
      const inv = await getInvoice(user.uid, params.id);

      const [banks, prof] = await Promise.all([
        getBankAccounts(user.uid).catch(() => []),
        getVendorProfile(user.uid).catch(() => null),
      ]);

      const bank = banks.find(
        (b) => b.id === inv.bankAccountId || b.id === inv.selectedBankAccount,
      );

      setBankAccount(bank);
      setInvoice({ ...inv, bankAccount: bank });
      setProfile(prof);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      setLoadError(
        error?.message === "Invoice not found"
          ? "We couldn't find this invoice. It may have been deleted."
          : "We couldn't load this invoice. Please check your connection and try again.",
      );
    }
  }

  function handleDownloadPdf() {
    if (invoice && profile) generateInvoicePdf(invoice, profile);
  }

  function handleDownloadReceipt() {
    if (invoice && profile) generateReceiptPdf(invoice, profile);
  }

  async function confirmDeleteInvoice() {
    setDeleteError("");
    setDeleting(true);

    try {
      await deleteInvoice(user.uid, params.id);
      router.push("/invoices");
    } catch (error) {
      console.error("Error deleting invoice:", error);
      setDeleteError("Could not delete this invoice. Please try again.");
      setDeleting(false);
    }
  }

  async function handleStatusChange(newStatus) {
    try {
      await updateInvoiceStatus(user.uid, params.id, newStatus);
      setInvoice((prev) => ({ ...prev, status: newStatus }));
    } catch (error) {
      console.error("Error updating status:", error);
    }
  }

  if (loadError) {
    return (
      <AppLayout>
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>
            <AlertTriangle size={26} />
          </div>

          <h2>Invoice unavailable</h2>
          <p>{loadError}</p>

          <div className={styles.errorActions}>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={fetchInvoice}
            >
              Try Again
            </button>

            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => router.push("/invoices")}
            >
              Back to invoices
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!invoice) {
    return (
      <AppLayout>
        <div className={styles.loading}>Loading invoice...</div>
      </AppLayout>
    );
  }

  const status = invoice.status || "pending";
  const items = Array.isArray(invoice.items) ? invoice.items : [];

  return (
    <AppLayout>
      <main className={styles.page}>
        <button
          type="button"
          className={styles.backLink}
          onClick={() => router.push("/invoices")}
        >
          <ArrowLeft size={18} />
          Back to invoices
        </button>

        <section className={styles.heroCard}>
          <div>
            <div className={styles.kicker}>
              <FileText size={18} />
              Invoice Details
            </div>

            <h1>{invoice.invoiceNumber}</h1>

            <div className={styles.statusRow}>
              <span className={`${styles.statusPill} ${styles[status]}`}>
                {status}
              </span>

              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className={styles.statusSelect}
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={handleDownloadPdf}
            >
              <Download size={18} />
              Download PDF
            </button>

            {status === "paid" && (
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={handleDownloadReceipt}
              >
                <Download size={18} />
                Download Receipt
              </button>
            )}

            {status === "pending" && (
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => router.push(`/invoices/${params.id}/edit`)}
              >
                <Pencil size={18} />
                Edit
              </button>
            )}

            <button
              type="button"
              className={styles.dangerButton}
              onClick={() => {
                setDeleteError("");
                setConfirmOpen(true);
              }}
            >
              <Trash2 size={18} />
              Delete
            </button>

            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => router.push("/invoices")}
            >
              Back
            </button>
          </div>
        </section>

        <section className={styles.summaryGrid}>
          <div className={styles.infoCard}>
            <div className={styles.iconWrap}>
              <UserRound size={20} />
            </div>
            <span>Client</span>
            <strong>{invoice.clientName}</strong>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.iconWrap}>
              <Phone size={20} />
            </div>
            <span>Phone</span>
            <strong>{invoice.clientPhone}</strong>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.iconWrap}>
              <CalendarDays size={20} />
            </div>
            <span>Date</span>
            <strong>{formatDate(invoice.createdAt)}</strong>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.iconWrap}>
              <Banknote size={20} />
            </div>
            <span>Total</span>
            <strong>{formatCurrency(invoice.total, invoice.currency)}</strong>
          </div>
        </section>

        <section className={styles.contentGrid}>
          <div className={styles.tableCard}>
            <div className={styles.sectionHeader}>
              <h2>Order Items</h2>
              <p>{items.length} item(s)</p>
            </div>

            <div className={styles.tableWrap}>
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={4} className={styles.noItems}>
                        This invoice has no items.
                      </td>
                    </tr>
                  ) : (
                    items.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>{formatCurrency(item.price, invoice.currency)}</td>
                        <td>
                          {formatCurrency(
                            item.quantity * item.price,
                            invoice.currency,
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className={styles.totalBox}>
              <span>Invoice Total</span>
              <strong>{formatCurrency(invoice.total, invoice.currency)}</strong>
            </div>
          </div>

          <aside className={styles.sideCard}>
            <h2>Payment Details</h2>

            {bankAccount ? (
              <div className={styles.bankDetails}>
                <div>
                  <span>Bank Name</span>
                  <strong>{bankAccount.bankName}</strong>
                </div>

                <div>
                  <span>Account Name</span>
                  <strong>{bankAccount.accountName}</strong>
                </div>

                <div>
                  <span>Account Number</span>
                  <strong>{bankAccount.accountNumber}</strong>
                </div>
              </div>
            ) : (
              <p className={styles.muted}>No bank account attached.</p>
            )}

            <div className={styles.noteBox}>
              <strong>Status note</strong>
              <p>
                Mark this invoice as paid once the client payment has been
                confirmed.
              </p>
            </div>
          </aside>
        </section>

        <ConfirmDialog
          open={confirmOpen}
          title="Delete this invoice?"
          message="The invoice will be removed from your records, and from your dashboard totals and receipts if it was marked paid."
          itemLabel={`${invoice.invoiceNumber} — ${invoice.clientName} (${formatCurrency(
            invoice.total,
            invoice.currency,
          )})`}
          warning="This action is permanent and cannot be undone."
          confirmLabel="Delete Invoice"
          loading={deleting}
          error={deleteError}
          onConfirm={confirmDeleteInvoice}
          onCancel={() => {
            if (deleting) return;
            setConfirmOpen(false);
            setDeleteError("");
          }}
        />
      </main>
    </AppLayout>
  );
}
