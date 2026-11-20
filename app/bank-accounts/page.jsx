"use client";

import { useEffect, useState } from "react";
import {
  Landmark,
  Plus,
  X,
  User,
  Hash,
  ChevronDown,
  Lock,
  WalletCards,
  Trash2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  addBankAccount,
  deleteBankAccount,
  getBankAccounts,
} from "../../services/vendorService";
import AppLayout from "../../components/AppLayout";
import ConfirmDialog from "../../components/ConfirmDialog";
import styles from "./bank.module.scss";

const NIGERIAN_BANKS = [
  "Access Bank",
  "Citibank Nigeria",
  "Ecobank Nigeria",
  "Fidelity Bank",
  "First Bank of Nigeria",
  "FCMB",
  "Globus Bank",
  "Guaranty Trust Bank",
  "Keystone Bank",
  "Kuda Bank",
  "Moniepoint MFB",
  "Opay",
  "PalmPay",
  "Polaris Bank",
  "Providus Bank",
  "Stanbic IBTC Bank",
  "Standard Chartered Bank",
  "Sterling Bank",
  "Union Bank",
  "United Bank for Africa",
  "Unity Bank",
  "Wema Bank",
  "Zenith Bank",
];

export default function BankAccountsPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [bankForm, setBankForm] = useState({
    bankName: "",
    accountName: "",
    accountNumber: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    if (user?.uid) fetchAccounts();
  }, [user]);

  async function fetchAccounts() {
    setLoading(true);

    try {
      const data = await getBankAccounts(user.uid);
      setAccounts(data);
    } catch (error) {
      console.error("Error fetching bank accounts:", error);
    } finally {
      setLoading(false);
    }
  }

  async function addBankAccountHandler(e) {
    e.preventDefault();
    setError("");

    if (
      !bankForm.accountName ||
      !bankForm.accountNumber ||
      !bankForm.bankName
    ) {
      setError("All bank fields are required");
      return;
    }

    try {
      setSaving(true);
      await addBankAccount(user.uid, bankForm);
      setBankForm({ bankName: "", accountName: "", accountNumber: "" });
      setModalOpen(false);
      await fetchAccounts();
    } catch (error) {
      setError("Could not add bank account");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDeleteAccount() {
    if (!accountToDelete) return;

    setDeleteError("");
    setDeleting(true);

    try {
      await deleteBankAccount(user.uid, accountToDelete.id);
      setAccounts((prev) =>
        prev.filter((acc) => acc.id !== accountToDelete.id),
      );
      setAccountToDelete(null);
    } catch (error) {
      console.error("Error deleting bank account:", error);
      setDeleteError("Could not delete this bank account. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  function maskAccountNumber(number) {
    const value = String(number || "");
    return `•••• ${value.slice(-4)}`;
  }

  return (
    <AppLayout>
      <main className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1>Bank Accounts</h1>
            <p>
              Manage the bank accounts where you receive payouts and display
              payment details on invoices.
            </p>
          </div>

          <button
            type="button"
            className={styles.addButton}
            onClick={() => setModalOpen(true)}
          >
            <Plus size={15} />
            <span>Add Bank Account</span>
          </button>
        </div>

        {loading ? (
          <section className={styles.loadingState}>
            Loading bank accounts...
          </section>
        ) : accounts.length === 0 ? (
          <section className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <WalletCards size={34} />
            </div>
            <h2>No bank accounts yet</h2>
            <p>Add your first bank account so customers know where to pay.</p>
            <button
              type="button"
              className={styles.addButtonSmall}
              onClick={() => setModalOpen(true)}
            >
              <Plus size={18} />
              Add Bank Account
            </button>
          </section>
        ) : (
          <section className={styles.grid}>
            {accounts.map((acc) => (
              <article className={styles.accountCard} key={acc.id}>
                <div className={styles.cardTop}>
                  <div className={styles.bankIcon}>
                    <Landmark size={28} />
                  </div>

                  <button
                    type="button"
                    className={styles.deleteButton}
                    onClick={() => {
                      setAccountToDelete(acc);
                      setDeleteError("");
                    }}
                    aria-label={`Delete ${acc.bankName} account`}
                    title="Delete account"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className={styles.cardBody}>
                  <h3>{acc.bankName}</h3>
                  <p>{acc.accountName}</p>
                </div>

                <div className={styles.divider} />

                <div className={styles.accountMeta}>
                  <span>Account Number</span>
                  <strong>{maskAccountNumber(acc.accountNumber)}</strong>
                </div>
              </article>
            ))}
          </section>
        )}

        {modalOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => {
                  setModalOpen(false);
                  setError("");
                }}
              >
                <X size={28} />
              </button>

              <div className={styles.modalHeader}>
                <h2>Add New Bank Account</h2>
                <p>Enter your banking details to receive payouts.</p>
              </div>

              <form
                onSubmit={addBankAccountHandler}
                className={styles.modalForm}
              >
                <div className={styles.formGroup}>
                  <label>Bank Name</label>
                  <div className={styles.selectWrap}>
                    <Landmark size={20} />
                    <select
                      value={bankForm.bankName}
                      onChange={(e) =>
                        setBankForm({ ...bankForm, bankName: e.target.value })
                      }
                    >
                      <option value="">Select your bank</option>
                      {NIGERIAN_BANKS.map((bank) => (
                        <option key={bank} value={bank}>
                          {bank}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={20} className={styles.chevron} />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Account Holder Name</label>
                  <div className={styles.inputWrap}>
                    <User size={20} />
                    <input
                      value={bankForm.accountName}
                      onChange={(e) =>
                        setBankForm({
                          ...bankForm,
                          accountName: e.target.value,
                        })
                      }
                      placeholder="e.g. John Doe"
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Account Number</label>
                  <div className={styles.inputWrap}>
                    <Hash size={20} />
                    <input
                      value={bankForm.accountNumber}
                      onChange={(e) =>
                        setBankForm({
                          ...bankForm,
                          accountNumber: e.target.value,
                        })
                      }
                      placeholder="0000 0000 0000"
                    />
                  </div>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={() => {
                      setModalOpen(false);
                      setError("");
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={saving}
                  >
                    <Plus size={20} />
                    {saving ? "Adding..." : "Add Account"}
                  </button>
                </div>
              </form>

              <div className={styles.secureNote}>
                <Lock size={16} />
                <span>Your banking information is encrypted and secure.</span>
              </div>
            </div>
          </div>
        )}

        <ConfirmDialog
          open={Boolean(accountToDelete)}
          title="Delete this bank account?"
          message="It will be removed from your payout accounts and will no longer be available when creating new invoices."
          itemLabel={
            accountToDelete
              ? `${accountToDelete.bankName} — ${accountToDelete.accountName} (${maskAccountNumber(
                  accountToDelete.accountNumber,
                )})`
              : ""
          }
          warning="This action is permanent and cannot be undone."
          confirmLabel="Delete Account"
          loading={deleting}
          error={deleteError}
          onConfirm={confirmDeleteAccount}
          onCancel={() => {
            if (deleting) return;
            setAccountToDelete(null);
            setDeleteError("");
          }}
        />
      </main>
    </AppLayout>
  );
}
