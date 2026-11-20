"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  Plus,
  ShoppingCart,
  Trash2,
  UserRound,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { calculateTotal, calculateRowAmount } from "../lib/utils";
import { getBankAccounts } from "../services/vendorService";
import styles from "./InvoiceForm.module.scss";

const currencies = [
  { value: "NGN", label: "NGN - Nigerian Naira" },
  { value: "GBP", label: "GBP (£) - British Pound" },
  { value: "USD", label: "USD ($) - US Dollar" },
  { value: "EUR", label: "EUR (€) - Euro" },
];

export const emptyInvoiceForm = {
  clientName: "",
  clientPhone: "",
  currency: "NGN",
  bankAccountId: "",
  items: [{ name: "", quantity: "1", price: "" }],
};

// Turns a stored invoice back into form values. Numbers become strings so
// the inputs behave the same as they do on a blank form.
export function invoiceToFormValues(invoice) {
  const items = Array.isArray(invoice?.items) ? invoice.items : [];

  return {
    clientName: invoice?.clientName || "",
    clientPhone: invoice?.clientPhone || "",
    currency: invoice?.currency || "NGN",
    bankAccountId: invoice?.bankAccountId || invoice?.selectedBankAccount || "",
    items: items.length
      ? items.map((item) => ({
          name: item?.name || "",
          quantity: item?.quantity != null ? String(item.quantity) : "",
          price: item?.price != null ? String(item.price) : "",
        }))
      : [...emptyInvoiceForm.items],
  };
}

// An empty field is missing, not zero, so it fails validation instead of
// silently becoming a free item.
function toNumber(value) {
  if (value === "" || value === null || value === undefined) return NaN;
  return Number(value);
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function InvoiceForm({
  title,
  subtitle,
  initialValues = emptyInvoiceForm,
  submitLabel,
  submittingLabel,
  submitIcon,
  onSubmit,
  cancelHref = "/invoices",
}) {
  const router = useRouter();
  const { user } = useAuth();

  const [banks, setBanks] = useState([]);
  const [form, setForm] = useState(initialValues);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) fetchBanks();
  }, [user]);

  async function fetchBanks() {
    try {
      const data = await getBankAccounts(user.uid);
      setBanks(data);

      // If the account this invoice pointed at has since been deleted, clear
      // it so a dangling reference can't be saved back silently.
      setForm((prev) =>
        prev.bankAccountId && !data.some((b) => b.id === prev.bankAccountId)
          ? { ...prev, bankAccountId: "" }
          : prev,
      );
    } catch (error) {
      console.error("Error fetching banks:", error);
    }
  }

  const total = useMemo(() => calculateTotal(form.items), [form.items]);

  function updateItem(index, field, value) {
    const updated = [...form.items];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, items: updated });
  }

  function addRow() {
    setForm({
      ...form,
      items: [...form.items, { name: "", quantity: "1", price: "" }],
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

    const items = form.items.map((item) => ({
      name: (item.name || "").trim(),
      quantity: toNumber(item.quantity),
      price: toNumber(item.price),
    }));

    if (items.some((i) => !i.name)) {
      setError("Every item needs a name.");
      return;
    }

    if (items.some((i) => !Number.isFinite(i.quantity) || i.quantity < 1)) {
      setError("Every item needs a quantity of at least 1.");
      return;
    }

    if (items.some((i) => !Number.isFinite(i.price) || i.price < 0)) {
      setError("Every item needs a price of 0 or more.");
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit({ ...form, items, total: calculateTotal(items) });
    } catch (error) {
      console.error("Invoice form submit error:", error);
      setError(error.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <button
        type="button"
        className={styles.backButton}
        onClick={() => router.push(cancelHref)}
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <header className={styles.header}>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </header>

      <form onSubmit={submit} className={styles.form} noValidate>
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
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
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
                  step="1"
                  inputMode="numeric"
                  placeholder="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                />

                <input
                  type="number"
                  min="0"
                  step="any"
                  inputMode="decimal"
                  placeholder="0.00"
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
            onClick={() => router.push(cancelHref)}
          >
            Cancel
          </button>

          <button
            type="submit"
            className={styles.primaryButton}
            disabled={submitting}
          >
            {submitIcon}
            {submitting ? submittingLabel : submitLabel}
          </button>
        </div>
      </form>
    </main>
  );
}
