import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { generateInvoiceNumber } from "../lib/utils";

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
    throw error;
  }
};

export const createInvoice = async (uid, data) => {
  try {
    const invoiceNumber = generateInvoiceNumber();
    const docRef = await addDoc(collection(db, "users", uid, "invoices"), {
      ...data,
      invoiceNumber,
      createdAt: new Date(),
    });
    return { id: docRef.id, invoiceNumber };
  } catch (error) {
    throw error;
  }
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
    throw error;
  }
};

export const updateInvoice = async (uid, invoiceId, data) => {
  try {
    const docRef = doc(db, "users", uid, "invoices", invoiceId);
    await updateDoc(docRef, data);
  } catch (error) {
    throw error;
  }
};

export const deleteInvoice = async (uid, invoiceId) => {
  try {
    await deleteDoc(doc(db, "users", uid, "invoices", invoiceId));
  } catch (error) {
    throw error;
  }
};
