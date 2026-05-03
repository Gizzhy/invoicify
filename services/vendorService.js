import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../lib/firebase";

export const getVendorProfile = async (uid) => {
  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      throw new Error("Profile not found");
    }
  } catch (error) {
    throw error;
  }
};

export const updateVendorProfile = async (uid, data) => {
  try {
    const docRef = doc(db, "users", uid);
    await updateDoc(docRef, data);
  } catch (error) {
    throw error;
  }
};

export const uploadLogo = async (uid, file) => {
  if (!uid) throw new Error("User ID is missing");
  if (!file) throw new Error("File is missing");

  const storageRef = ref(storage, `users/${uid}/profile/logo-${Date.now()}`);

  await uploadBytes(storageRef, file, {
    contentType: file.type,
  });

  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};

export const getBankAccounts = async (uid) => {
  try {
    const querySnapshot = await getDocs(
      collection(db, "users", uid, "bankAccounts"),
    );
    const accounts = [];
    querySnapshot.forEach((doc) => {
      accounts.push({ id: doc.id, ...doc.data() });
    });
    return accounts;
  } catch (error) {
    throw error;
  }
};

export const addBankAccount = async (uid, data) => {
  try {
    const docRef = await addDoc(collection(db, "users", uid, "bankAccounts"), {
      ...data,
      createdAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

export const deleteBankAccount = async (uid, accountId) => {
  try {
    await deleteDoc(doc(db, "users", uid, "bankAccounts", accountId));
  } catch (error) {
    throw error;
  }
};
