import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  deleteField,
  serverTimestamp,
  query,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { generateInvoiceNumber, generateReceiptNumber } from "../lib/utils";

// Newest first, ordered by Firestore rather than in the browser. Pass
// `limitCount` to fetch a single page, and `startAfterValue` (the last
// invoice's createdAt) to fetch the page after it.
export const getInvoices = async (uid, options = {}) => {
  const { limitCount, startAfterValue } = options;

  try {
    const constraints = [orderBy("createdAt", "desc")];

    if (startAfterValue) {
      constraints.push(startAfter(startAfterValue));
    }

    if (limitCount) {
      constraints.push(limit(limitCount));
    }

    const querySnapshot = await getDocs(
      query(collection(db, "users", uid, "invoices"), ...constraints),
    );

    const invoices = [];
    querySnapshot.forEach((doc) => {
      invoices.push({ id: doc.id, ...doc.data() });
    });

    return invoices;
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

export const deleteInvoice = async (uid, invoiceId) => {
  try {
    await deleteDoc(doc(db, "users", uid, "invoices", invoiceId));
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
    } else {
      // Back to pending means the payment was not actually received, so the
      // receipt it produced is withdrawn with it. Marking it paid again
      // mints a fresh receipt number.
      updateData.paidAt = deleteField();
      updateData.receiptNumber = deleteField();
    }

    await updateInvoice(uid, invoiceId, updateData);
  } catch (error) {
    console.error(error);
    throw error;
  }
};
