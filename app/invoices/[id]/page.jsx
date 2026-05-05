"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useParams } from "next/navigation";
import Link from "next/link";
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
import AppLayout from "../../../components/AppLayout";

export default function InvoiceDetail() {
  const { user } = useAuth();
  const params = useParams();
  const [invoice, setInvoice] = useState(null);
  const [bankAccount, setBankAccount] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (user && params.id) {
      fetchInvoice();
    }
  }, [user, params.id]);

  async function fetchInvoice() {
    try {
      const inv = await getInvoice(user.uid, params.id);
      // Fetch bank account details using bankAccountId or selectedBankAccount.
      const banks = await getBankAccounts(user.uid);
      const bank = banks.find(
        (b) => b.id === inv.bankAccountId || b.id === inv.selectedBankAccount,
      );
      setBankAccount(bank);
      setInvoice({ ...inv, bankAccount: bank });
      // Fetch vendor profile
      const prof = await getVendorProfile(user.uid);
      setProfile(prof);
    } catch (error) {
      console.error("Error fetching invoice:", error);
    }
  }

  const handleDownloadPdf = () => {
    if (invoice && profile) {
      generateInvoicePdf(invoice, profile);
    }
  };

  async function handleStatusChange(newStatus) {
    try {
      await updateInvoiceStatus(user.uid, params.id, newStatus);
      setInvoice((prev) => ({ ...prev, status: newStatus }));
    } catch (error) {
      console.error("Error updating status:", error);
    }
  }

  if (!invoice)
    return (
      <AppLayout>
        <div className="container card">Loading...</div>
      </AppLayout>
    );

  return (
    <AppLayout>
      <div className="container" style={{ marginTop: "0" }}>
        <div className="card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h1>Invoice {invoice.invoiceNumber}</h1>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  marginTop: "0.5rem",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    padding: "0.25rem 0.75rem",
                    borderRadius: "9999px",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    textTransform: "capitalize",
                    background:
                      invoice.status === "paid" ? "#d1fae5" : "#fef3c7",
                    color: invoice.status === "paid" ? "#065f46" : "#d97706",
                  }}
                >
                  {invoice.status || "pending"}
                </span>
                <select
                  value={invoice.status || "pending"}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  style={{
                    padding: "0.25rem 0.5rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "0.25rem",
                    background: "white",
                    fontSize: "0.875rem",
                  }}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>
            <div>
              <button
                className="button"
                onClick={handleDownloadPdf}
                style={{ marginRight: "0.5rem" }}
              >
                Download PDF
              </button>
              <Link href="/invoices">
                <button className="button">Back</button>
              </Link>
            </div>
          </div>
          <div style={{ marginTop: "1rem" }}>
            <p>Client: {invoice.clientName}</p>
            <p>Client Phone: {invoice.clientPhone}</p>
            <p>Date: {formatDate(invoice.createdAt)}</p>
            <p>Currency: {invoice.currency}</p>
            {bankAccount && (
              <p>
                Bank: {bankAccount.bankName} {bankAccount.accountNumber} (
                {bankAccount.accountName})
              </p>
            )}
            <p>Total: {formatCurrency(invoice.total, invoice.currency)}</p>
          </div>
          <table
            style={{
              width: "100%",
              marginTop: "1rem",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid #cbd5e1" }}>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
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
      </div>
    </AppLayout>
  );
}
