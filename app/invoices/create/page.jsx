"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  FilePlus2,
  Plus,
  ShoppingCart,
  Trash2,
  UserRound,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { calculateTotal, calculateRowAmount } from "../../../lib/utils";
import { getBankAccounts } from "../../../services/vendorService";
import { createInvoice } from "../../../services/invoiceService";
import AppLayout from "../../../components/AppLayout";
import styles from "./create.module.scss";

const currencies = [
  { value: "NGN", label: "NGN - Nigerian Naira" },
  { value: "GBP", label: "GBP (£) - British Pound" },
  { value: "USD", label: "USD ($) - US Dollar" },
  { value: "EUR", label: "EUR (€) - Euro" },
];

export default function CreateInvoicePage() {
  const router = useRouter();
  const { user } = useAuth();

  const [banks, setBanks] = useState([]);
  const [form, setForm] = useState({
    clientName: "",
    clientPhone: "",
    currency: "NGN",
    bankAccountId: "",
    items: [{ name: "", quantity: 1, price: 0 }],
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) fetchBanks();
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

  function formatMoney(value) {
    return Number(value || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function updateItem(index, field, value) {
    const updated = [...form.items];
    updated[index] = {
      ...updated[index],
      [field]: field === "name" ? value : Number(value),
    };
    setForm({ ...form, items: updated });
  }

  function addRow() {
    setForm({
      ...form,
      items: [...form.items, { name: "", quantity: 1, price: 0 }],
    });
  }

  function removeRow(index) {
    if (form.items.length <= 1) return;
    setForm({ ...form, items: form.items.filter((_, i) => i !== index) });
  }

  async function submit(e) {
    e.preventDefault();
    setError("");

    if (!form.clientName || !form.clientPhone || !form.bankAccountId) {
      setError("Client name, phone number, and bank account are required.");
      return;
    }

    if (form.items.some((i) => !i.name || i.quantity <= 0 || i.price < 0)) {
      setError("All items must have a name, quantity, and valid price.");
      return;
    }

    setSubmitting(true);

    try {
      const createdInvoice = await createInvoice(user.uid, { ...form, total });

      if (!createdInvoice?.id) {
        throw new Error("Invoice created but no ID was returned");
      }

      router.push(`/invoices/${createdInvoice.id}`);
    } catch (error) {
      console.error("Create invoice error:", error);
      setError(error.message || "Failed to create invoice");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppLayout>
      <main className={styles.page}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => router.push("/invoices")}
        >
          <ArrowLeft size={18} />
          Back to invoices
        </button>

        <header className={styles.header}>
          <h1>Create New Invoice</h1>
          <p>
            Fill in the details below to generate a professional invoice for
            your client.
          </p>
        </header>

        <form onSubmit={submit} className={styles.form}>
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <UserRound size={24} />
                <h2>Client Details</h2>
              </div>
            </div>

            <div className={styles.gridTwo}>
              <div className={styles.formGroup}>
                <label>Client Name</label>
                <input
                  value={form.clientName}
                  onChange={(e) =>
                    setForm({ ...form, clientName: e.target.value })
                  }
                  placeholder="e.g. Alice Johnson"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Phone Number</label>
                <input
                  value={form.clientPhone}
                  onChange={(e) =>
                    setForm({ ...form, clientPhone: e.target.value })
                  }
                  placeholder="+23470123456789"
                />
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <Banknote size={24} />
                <h2>Invoice Settings</h2>
              </div>
            </div>

            <div className={styles.gridTwo}>
              <div className={styles.formGroup}>
                <label>Currency</label>
                <select
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

              <div className={styles.formGroup}>
                <label>Bank Account</label>
                <select
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
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <ShoppingCart size={24} />
                <h2>Order Items</h2>
              </div>

              <button type="button" className={styles.addItem} onClick={addRow}>
                <Plus size={18} />
                Add Item
              </button>
            </div>

            <div className={styles.itemsTable}>
              <div className={styles.tableHead}>
                <span>Item Name</span>
                <span>Qty</span>
                <span>Price</span>
                <span>Total</span>
                <span />
              </div>

              {form.items.map((item, idx) => (
                <div className={styles.itemRow} key={idx}>
                  <input
                    placeholder="Item name"
                    value={item.name}
                    onChange={(e) => updateItem(idx, "name", e.target.value)}
                  />

                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(idx, "quantity", e.target.value)
                    }
                  />

                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={item.price}
                    onChange={(e) => updateItem(idx, "price", e.target.value)}
                  />

                  <div className={styles.rowTotal}>
                    {form.currency}{" "}
                    {formatMoney(calculateRowAmount(item.quantity, item.price))}
                  </div>

                  <button
                    type="button"
                    className={styles.deleteButton}
                    onClick={() => removeRow(idx)}
                    disabled={form.items.length <= 1}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            <div className={styles.summary}>
              <span>Total</span>
              <strong>
                {form.currency} {formatMoney(total)}
              </strong>
            </div>
          </section>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => router.push("/invoices")}
            >
              Cancel
            </button>

            <button
              type="submit"
              className={styles.primaryButton}
              disabled={submitting}
            >
              <FilePlus2 size={19} />
              {submitting ? "Generating..." : "Generate Invoice"}
            </button>
          </div>
        </form>
      </main>
    </AppLayout>
  );
}
