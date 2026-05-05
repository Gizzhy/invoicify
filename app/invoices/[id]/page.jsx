"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useParams } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "../../../lib/utils";
import { getInvoice } from "../../../services/invoiceService";
import {
  getBankAccounts,
  getVendorProfile,
} from "../../../services/vendorService";
import { generateInvoicePdf } from "../../../lib/generateInvoicePdf";
import AppLayout from "../../../components/AppLayout";

const currencySymbols = { NGN: "₦", GBP: "£", USD: "$", EUR: "€" };

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
            <h1>Invoice {invoice.invoiceNumber}</h1>
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
            <p>Date: {invoice.createdAt.toDate().toLocaleDateString()}</p>
            <p>Currency: {invoice.currency}</p>
            {bankAccount && (
              <p>
                Bank: {bankAccount.bankName} {bankAccount.accountNumber} (
                {bankAccount.accountName})
              </p>
            )}
            <p>
              Total: {currencySymbols[invoice.currency]}
              {invoice.total.toFixed(2)}
            </p>
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
                  <td>
                    {currencySymbols[invoice.currency]}
                    {item.price.toFixed(2)}
                  </td>
                  <td>
                    {currencySymbols[invoice.currency]}
                    {(item.quantity * item.price).toFixed(2)}
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
