import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { generateInvoiceNumber, generateReceiptNumber } from "../lib/utils";

export const getInvoices = async (uid) => {
  try {
    const querySnapshot = await getDocs(
      collection(db, "users", uid, "invoices"),
    );
    const invoices = [];
    querySnapshot.forEach((doc) => {
      invoices.push({ id: doc.id, ...doc.data() });
    });
    return invoices.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const createInvoice = async (uid, data) => {
  const invoiceNumber = generateInvoiceNumber();

  const invoiceData = {
    ...data,
    invoiceNumber,
    status: "pending",
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(
    collection(db, "users", uid, "invoices"),
    invoiceData,
  );

  return {
    id: docRef.id,
    ...invoiceData,
  };
};

export const getInvoice = async (uid, invoiceId) => {
  try {
    const docRef = doc(db, "users", uid, "invoices", invoiceId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error("Invoice not found");
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateInvoice = async (uid, invoiceId, data) => {
  try {
    const docRef = doc(db, "users", uid, "invoices", invoiceId);
    await updateDoc(docRef, data);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateInvoiceStatus = async (uid, invoiceId, status) => {
  if (!["pending", "paid"].includes(status)) {
    throw new Error("Invalid status");
  }
  try {
    const updateData = { status };

    if (status === "paid") {
      updateData.paidAt = serverTimestamp();
      // Get the invoice to check if it already has a receiptNumber
      const invoice = await getInvoice(uid, invoiceId);
      if (!invoice.receiptNumber) {
        updateData.receiptNumber = generateReceiptNumber();
      }
    }

    await updateInvoice(uid, invoiceId, updateData);
  } catch (error) {
    console.error(error);
    throw error;
  }
};
