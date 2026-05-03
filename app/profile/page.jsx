"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import {
  getVendorProfile,
  updateVendorProfile,
  uploadLogo,
  getBankAccounts,
  addBankAccount,
  deleteBankAccount,
} from "../../services/vendorService";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState({
    brandName: "",
    brandDesc: "",
    address: "",
    phone: "",
    logoUrl: "",
  });
  const [accounts, setAccounts] = useState([]);
  const [bankForm, setBankForm] = useState({
    accountName: "",
    accountNumber: "",
    bankName: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
    if (user) {
      syncData();
    }
  }, [user, loading, router]);

  async function syncData() {
    try {
      const profileData = await getVendorProfile(user.uid);
      setProfile({
        brandName: profileData.brandName || "",
        brandDesc: profileData.brandDesc || "",
        address: profileData.address || "",
        phone: profileData.phone || "",
        logoUrl: profileData.logoUrl || "",
      });
      const accountsData = await getBankAccounts(user.uid);
      setAccounts(accountsData);
    } catch (error) {
      console.error("Error syncing data:", error);
    }
  }

  async function updateProfile(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateVendorProfile(user.uid, profile);
      setError("");
      alert("Profile updated");
    } catch (error) {
      setError("Failed to update");
    } finally {
      setSaving(false);
    }
  }

  async function onLogoChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!user?.uid) {
      setError("User not logged in");
      return;
    }

    try {
      const logoUrl = await uploadLogo(user.uid, file);
      setProfile((prev) => ({ ...prev, logoUrl }));
    } catch (error) {
      console.error("Logo upload error:", error);
      setError(error.message || "Failed to upload logo");
    }
  }

  async function addBankAccountHandler(e) {
    e.preventDefault();
    if (
      !bankForm.accountName ||
      !bankForm.accountNumber ||
      !bankForm.bankName
    ) {
      setError("All bank fields are required");
      return;
    }
    try {
      await addBankAccount(user.uid, bankForm);
      setError("");
      setBankForm({ accountName: "", accountNumber: "", bankName: "" });
      await syncData();
    } catch (error) {
      setError("Could not add");
    }
  }

  async function deleteBank(id) {
    try {
      await deleteBankAccount(user.uid, id);
      await syncData();
    } catch (error) {
      console.error("Error deleting bank account:", error);
    }
  }

  if (loading) return <div className="container card">Loading...</div>;

  return (
    <div className="container" style={{ marginTop: "2rem" }}>
      <div className="card" style={{ marginBottom: "1rem" }}>
        <h1>Profile</h1>
        <form onSubmit={updateProfile}>
          <label className="label">Brand Name</label>
          <input
            className="input"
            value={profile.brandName}
            onChange={(e) =>
              setProfile({ ...profile, brandName: e.target.value })
            }
          />

          <label className="label">Brand Description</label>
          <textarea
            className="textarea"
            value={profile.brandDesc}
            onChange={(e) =>
              setProfile({ ...profile, brandDesc: e.target.value })
            }
          />

          <label className="label">Address</label>
          <textarea
            className="textarea"
            value={profile.address}
            onChange={(e) =>
              setProfile({ ...profile, address: e.target.value })
            }
          />

          <label className="label">Phone</label>
          <input
            className="input"
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
          />

          <label className="label">Brand Logo</label>
          <input type="file" accept="image/*" onChange={onLogoChange} />
          {profile.logoUrl && (
            <img
              src={profile.logoUrl}
              alt="logo"
              style={{
                width: "120px",
                marginTop: "1rem",
                borderRadius: "10px",
              }}
            />
          )}

          {error && <div className="error">{error}</div>}

          <button className="button" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>

      <div className="card">
        <h2>Bank Accounts</h2>
        <form onSubmit={addBankAccountHandler} style={{ marginBottom: "1rem" }}>
          <label className="label">Account Name</label>
          <input
            className="input"
            value={bankForm.accountName}
            onChange={(e) =>
              setBankForm({ ...bankForm, accountName: e.target.value })
            }
          />

          <label className="label">Account Number</label>
          <input
            className="input"
            value={bankForm.accountNumber}
            onChange={(e) =>
              setBankForm({ ...bankForm, accountNumber: e.target.value })
            }
          />

          <label className="label">Bank Name</label>
          <input
            className="input"
            value={bankForm.bankName}
            onChange={(e) =>
              setBankForm({ ...bankForm, bankName: e.target.value })
            }
          />

          <button className="button" type="submit">
            Add Bank Account
          </button>
        </form>

        <h3>Saved Accounts</h3>
        {accounts.length === 0 ? (
          <p>No saved accounts yet.</p>
        ) : (
          <ul>
            {accounts.map((acc) => (
              <li
                key={acc.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.6rem",
                }}
              >
                <span>
                  {acc.bankName} - {acc.accountNumber} ({acc.accountName})
                </span>
                <button
                  className="button danger"
                  onClick={() => deleteBank(acc.id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
