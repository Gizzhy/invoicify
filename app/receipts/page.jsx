"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import { Download, ArrowRight } from "lucide-react";
import { getInvoices } from "../../services/invoiceService";
import {
  getBankAccounts,
  getVendorProfile,
} from "../../services/vendorService";
import { formatCurrency, formatDate } from "../../lib/utils";
import { generateReceiptPdf } from "../../lib/generateReceiptPdf";
import AppLayout from "../../components/AppLayout";
import styles from "./page.module.scss";

export default function ReceiptsPage() {
  const { user } = useAuth();
  const [receipts, setReceipts] = useState([]);
  const [profile, setProfile] = useState(null);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  async function fetchData() {
    try {
      const invoices = await getInvoices(user.uid);
      const paidInvoices = invoices.filter(
        (inv) => (inv.status || "pending") === "paid",
      );
      setReceipts(paidInvoices);

      const prof = await getVendorProfile(user.uid);
      setProfile(prof);

      const banks = await getBankAccounts(user.uid);
      setBankAccounts(banks);
    } catch (error) {
      console.error("Error fetching receipts:", error);
    }
  }

  async function handleDownloadReceipt(receipt) {
    try {
      setDownloadingId(receipt.id);
      const bank = bankAccounts.find(
        (b) =>
          b.id === receipt.bankAccountId ||
          b.id === receipt.selectedBankAccount,
      );

      const receiptWithBank = {
        ...receipt,
        bankAccount: bank,
      };

      if (profile) {
        await generateReceiptPdf(receiptWithBank, profile);
      }
    } catch (error) {
      console.error("Error downloading receipt:", error);
    } finally {
      setDownloadingId(null);
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

  function getPaidDate(receipt) {
    if (receipt.paidAt) {
      return receipt.paidAt.toDate
        ? receipt.paidAt.toDate().toLocaleDateString()
        : new Date(receipt.paidAt).toLocaleDateString();
    }
    return formatDate(receipt.createdAt);
  }

  return (
    <AppLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerText}>
            <h1>Receipts</h1>
            <p>View and download receipts for paid invoices.</p>
          </div>
        </div>

        {receipts.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyContent}>
              <h2>No receipts yet</h2>
              <p>
                Receipts will appear here once an invoice is marked as paid.
              </p>
              <Link href="/invoices">
                <button className={styles.primaryBtn}>
                  Go to Invoices
                  <ArrowRight size={18} />
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Receipt ID</th>
                  <th>Client</th>
                  <th>Paid Date</th>
                  <th>Amount</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((receipt) => (
                  <tr key={receipt.id}>
                    <td>
                      <Link
                        href={`/invoices/${receipt.id}`}
                        className={styles.receiptId}
                      >
                        {receipt.receiptNumber || receipt.invoiceNumber}
                      </Link>
                    </td>
                    <td>
                      <div className={styles.clientCell}>
                        <div className={styles.avatar}>
                          {getInitials(receipt.clientName)}
                        </div>
                        {receipt.clientName}
                      </div>
                    </td>
                    <td>{getPaidDate(receipt)}</td>
                    <td className={styles.amount}>
                      {formatCurrency(receipt.total, receipt.currency)}
                    </td>
                    <td>
                      <button
                        className={styles.downloadBtn}
                        onClick={() => handleDownloadReceipt(receipt)}
                        disabled={downloadingId === receipt.id}
                      >
                        <Download size={16} />
                        {downloadingId === receipt.id
                          ? "Downloading..."
                          : "Download"}
                      </button>
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
