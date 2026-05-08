"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  CalendarDays,
  Download,
  FileText,
  Phone,
  UserRound,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { formatCurrency, formatDate } from "../../../lib/utils";
import {
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
import styles from "./id.module.scss";

export default function InvoiceDetail() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();

  const [invoice, setInvoice] = useState(null);
  const [bankAccount, setBankAccount] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (user && params.id) fetchInvoice();
  }, [user, params.id]);

  async function fetchInvoice() {
    try {
      const inv = await getInvoice(user.uid, params.id);
      const banks = await getBankAccounts(user.uid);
      const bank = banks.find(
        (b) => b.id === inv.bankAccountId || b.id === inv.selectedBankAccount,
      );

      setBankAccount(bank);
      setInvoice({ ...inv, bankAccount: bank });
      setProfile(await getVendorProfile(user.uid));
    } catch (error) {
      console.error("Error fetching invoice:", error);
    }
  }

  function handleDownloadPdf() {
    if (invoice && profile) generateInvoicePdf(invoice, profile);
  }

  function handleDownloadReceipt() {
    if (invoice && profile) generateReceiptPdf(invoice, profile);
  }

  async function handleStatusChange(newStatus) {
    try {
      await updateInvoiceStatus(user.uid, params.id, newStatus);
      setInvoice((prev) => ({ ...prev, status: newStatus }));
    } catch (error) {
      console.error("Error updating status:", error);
    }
  }

  if (!invoice) {
    return (
      <AppLayout>
        <div className={styles.loading}>Loading invoice...</div>
      </AppLayout>
    );
  }

  const status = invoice.status || "pending";

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
              <p>{invoice.items?.length || 0} item(s)</p>
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
                  {invoice.items.map((item, idx) => (
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
                  ))}
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
      </main>
    </AppLayout>
  );
}
