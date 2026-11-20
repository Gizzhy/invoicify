"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, Save } from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";
import { getInvoice, updateInvoice } from "../../../../services/invoiceService";
import AppLayout from "../../../../components/AppLayout";
import InvoiceForm, {
  invoiceToFormValues,
} from "../../../../components/InvoiceForm";
import styles from "./edit.module.scss";

export default function EditInvoicePage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();

  const [invoice, setInvoice] = useState(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (user && params.id) fetchInvoice();
  }, [user, params.id]);

  async function fetchInvoice() {
    setLoadError("");

    try {
      setInvoice(await getInvoice(user.uid, params.id));
    } catch (error) {
      console.error("Error fetching invoice:", error);
      setLoadError(
        error?.message === "Invoice not found"
          ? "We couldn't find this invoice. It may have been deleted."
          : "We couldn't load this invoice. Please check your connection and try again.",
      );
    }
  }

  async function handleUpdate(payload) {
    await updateInvoice(user.uid, params.id, payload);
    router.push(`/invoices/${params.id}`);
  }

  if (loadError) {
    return (
      <AppLayout>
        <div className={styles.notice}>
          <div className={styles.noticeIcon}>
            <AlertTriangle size={26} />
          </div>

          <h2>Invoice unavailable</h2>
          <p>{loadError}</p>

          <div className={styles.noticeActions}>
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

  // A paid invoice has a receipt the client may already hold, so its
  // amounts stay locked until it is set back to pending.
  if ((invoice.status || "pending") === "paid") {
    return (
      <AppLayout>
        <div className={styles.notice}>
          <div className={styles.noticeIcon}>
            <AlertTriangle size={26} />
          </div>

          <h2>This invoice is marked paid</h2>
          <p>
            Paid invoices can&apos;t be edited, because a receipt has already
            been issued for {invoice.invoiceNumber}. Set it back to pending on
            the invoice page if you need to change it.
          </p>

          <div className={styles.noticeActions}>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => router.push(`/invoices/${params.id}`)}
            >
              Back to Invoice
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <InvoiceForm
        title={`Edit ${invoice.invoiceNumber}`}
        subtitle="Update the details below. The invoice number and date stay the same."
        initialValues={invoiceToFormValues(invoice)}
        submitLabel="Save Changes"
        submittingLabel="Saving..."
        submitIcon={<Save size={19} />}
        onSubmit={handleUpdate}
        cancelHref={`/invoices/${params.id}`}
      />
    </AppLayout>
  );
}
