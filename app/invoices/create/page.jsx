"use client";

import { useRouter } from "next/navigation";
import { FilePlus2 } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { createInvoice } from "../../../services/invoiceService";
import AppLayout from "../../../components/AppLayout";
import InvoiceForm, {
  emptyInvoiceForm,
} from "../../../components/InvoiceForm";

export default function CreateInvoicePage() {
  const router = useRouter();
  const { user } = useAuth();

  async function handleCreate(payload) {
    const createdInvoice = await createInvoice(user.uid, payload);

    if (!createdInvoice?.id) {
      throw new Error("Invoice created but no ID was returned");
    }

    router.push(`/invoices/${createdInvoice.id}`);
  }

  return (
    <AppLayout>
      <InvoiceForm
        title="Create New Invoice"
        subtitle="Fill in the details below to generate a professional invoice for your client."
        initialValues={emptyInvoiceForm}
        submitLabel="Generate Invoice"
        submittingLabel="Generating..."
        submitIcon={<FilePlus2 size={19} />}
        onSubmit={handleCreate}
      />
    </AppLayout>
  );
}
