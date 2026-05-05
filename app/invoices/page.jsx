"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import { getInvoices } from "../../services/invoiceService";
import AppLayout from "../../components/AppLayout";

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
            <h1>Invoices</h1>
            <Link href="/invoices/create">
              <button className="button">Create New Invoice</button>
            </Link>
          </div>
          {invoices.length === 0 ? (
            <p>No invoices yet.</p>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "1rem",
              }}
            >
              <thead>
                <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <th style={{ textAlign: "left" }}>ID</th>
                  <th>Client</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    style={{ borderBottom: "1px solid #e2e8f0" }}
                  >
                    <td>{inv.invoiceNumber}</td>
                    <td>{inv.clientName}</td>
                    <td>
                      {inv.currency} {inv.total.toFixed(2)}
                    </td>
                    <td>{inv.createdAt.toDate().toLocaleDateString()}</td>
                    <td>
                      <Link href={`/invoices/${inv.id}`}>
                        <button className="button">View</button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
