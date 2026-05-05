"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import Link from "next/link";
import { calculateTotal, calculateRowAmount } from "../../../lib/utils";
import { getBankAccounts } from "../../../services/vendorService";
import { createInvoice } from "../../../services/invoiceService";
import AppLayout from "../../../components/AppLayout";

const currencies = [
  { value: "NGN", label: "Naira (₦)" },
  { value: "GBP", label: "Pounds (£)" },
  { value: "USD", label: "Dollars ($)" },
  { value: "EUR", label: "Euro (€)" },
];

export default function CreateInvoicePage() {
  const { user } = useAuth();
  const [banks, setBanks] = useState([]);
  const [form, setForm] = useState({
    clientName: "",
    clientPhone: "",
    currency: "USD",
    bankAccountId: "",
    items: [{ name: "", quantity: 1, price: 0 }],
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchBanks();
    }
  }, [user]);

  async function fetchBanks() {
    try {
      const data = await getBankAccounts(user.uid);
      setBanks(data);
    } catch (error) {
      console.error("Error fetching banks:", error);
    }
  }

  const total = useMemo(() => calculateTotal(form.items), [form.items]);

  function updateItem(index, field, value) {
    const updated = [...form.items];
    updated[index] = {
      ...updated[index],
      [field]: field === "name" ? value : Number(value),
    };
    setForm({ ...form, items: updated });
  }

  const addRow = () => {
    setForm({
      ...form,
      items: [...form.items, { name: "", quantity: 1, price: 0 }],
    });
  };

  const removeRow = (index) => {
    if (form.items.length <= 1) return;
    setForm({ ...form, items: form.items.filter((_, i) => i !== index) });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.clientName || !form.clientPhone || !form.bankAccountId) {
      setError("Client info and bank account are required");
      return;
    }
    if (form.items.some((i) => !i.name || i.quantity <= 0 || i.price < 0)) {
      setError("All items must have name, quantity, and price");
      return;
    }

    setSubmitting(true);
    try {
      const data = await createInvoice(user.uid, { ...form, total });
      router.push(`/invoices/${data.id}`);
    } catch (error) {
      setError("Failed to create invoice");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="container" style={{ marginTop: "0" }}>
        <div className="card">
          <h1>Create New Invoice</h1>
          <Link href="/invoices">
            <button className="button" style={{ marginBottom: "1rem" }}>
              Back to invoices
            </button>
          </Link>
          <form onSubmit={submit}>
            <label className="label">Client Name</label>
            <input
              className="input"
              value={form.clientName}
              onChange={(e) => setForm({ ...form, clientName: e.target.value })}
            />
            <label className="label">Client Phone</label>
            <input
              className="input"
              value={form.clientPhone}
              onChange={(e) =>
                setForm({ ...form, clientPhone: e.target.value })
              }
            />

            <div className="grid grid-2">
              <div>
                <label className="label">Currency</label>
                <select
                  className="select"
                  value={form.currency}
                  onChange={(e) =>
                    setForm({ ...form, currency: e.target.value })
                  }
                >
                  {currencies.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Bank Account</label>
                <select
                  className="select"
                  value={form.bankAccountId}
                  onChange={(e) =>
                    setForm({ ...form, bankAccountId: e.target.value })
                  }
                >
                  <option value="">Select account</option>
                  {banks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bankName} - {b.accountNumber}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <h3>Order Items</h3>
            {form.items.map((item, idx) => (
              <div
                key={idx}
                className="grid"
                style={{ marginBottom: "0.5rem" }}
              >
                <input
                  className="input"
                  placeholder="Item name"
                  value={item.name}
                  onChange={(e) => updateItem(idx, "name", e.target.value)}
                />
                <input
                  className="input"
                  type="number"
                  min="1"
                  placeholder="Quantity"
                  value={item.quantity}
                  onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                />
                <input
                  className="input"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Price"
                  value={item.price}
                  onChange={(e) => updateItem(idx, "price", e.target.value)}
                />
                <input
                  className="input"
                  readOnly
                  value={calculateRowAmount(item.quantity, item.price).toFixed(
                    2,
                  )}
                />
                <button
                  type="button"
                  className="button danger"
                  onClick={() => removeRow(idx)}
                  style={{ width: "100px" }}
                >
                  Delete
                </button>
              </div>
            ))}
            <button type="button" className="button" onClick={addRow}>
              Add Item
            </button>
            <div style={{ marginTop: "1rem", fontWeight: 700 }}>
              Total: {form.currency} {total.toFixed(2)}
            </div>

            {error && <div className="error">{error}</div>}

            <button
              type="submit"
              className="button"
              style={{ marginTop: "1rem" }}
              disabled={submitting}
            >
              {submitting ? "Generating..." : "Generate Invoice"}
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
