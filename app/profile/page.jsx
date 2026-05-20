"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getVendorProfile,
  updateVendorProfile,
  uploadLogo,
} from "../../services/vendorService";
import AppLayout from "../../components/AppLayout";
import styles from "./profile.module.scss";

export default function ProfilePage() {
  const { user } = useAuth();
  const BRAND_DESC_LIMIT = 120;
  const [profile, setProfile] = useState({
    brandName: "",
    brandDesc: "",
    address: "",
    phone: "",
    logoUrl: "",
  });

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  async function fetchProfile() {
    try {
      const data = await getVendorProfile(user.uid);
      setProfile({
        brandName: data.brandName || "",
        brandDesc: data.brandDesc || "",
        address: data.address || "",
        phone: data.phone || "",
        logoUrl: data.logoUrl || "",
      });
    } catch (err) {
      console.error(err);
    }
  }

  async function updateProfile(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateVendorProfile(user.uid, profile);
      setError("");
    } catch (err) {
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  async function onLogoChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const url = await uploadLogo(user.uid, file);
      setProfile((prev) => ({ ...prev, logoUrl: url }));
    } catch (err) {
      setError("Logo upload failed");
    }
  }

  return (
    <AppLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1>Brand Profile Settings</h1>
          <p>
            Manage your brand identity and invoice appearance. These details
            will reflect on your generated invoices.
          </p>
        </div>

        <form onSubmit={updateProfile} className={styles.card}>
          {/* LOGO */}
          <div className={styles.logoSection}>
            <label>Company Logo</label>

            <div className={styles.logoUpload}>
              <input type="file" accept="image/*" onChange={onLogoChange} />

              {profile.logoUrl ? (
                <img src={profile.logoUrl} alt="logo" />
              ) : (
                <span>Click to upload or drag image</span>
              )}
            </div>
          </div>

          {/* GRID */}
          <div className={styles.grid}>
            <div>
              <label>Brand Name</label>
              <input
                value={profile.brandName}
                onChange={(e) =>
                  setProfile({ ...profile, brandName: e.target.value })
                }
                placeholder="Your company name"
              />
            </div>

            <div>
              <label>Phone Number</label>
              <input
                value={profile.phone}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
                placeholder="+234..."
              />
            </div>
          </div>

          <div className={styles.full}>
            <label>Brand Description / Tagline</label>
            <textarea
              value={profile.brandDesc}
              maxLength={BRAND_DESC_LIMIT}
              onChange={(e) =>
                setProfile({ ...profile, brandDesc: e.target.value })
              }
              placeholder="Short description for invoices"
            />
            <p className={styles.charCount}>
              {profile.brandDesc.length}/{BRAND_DESC_LIMIT}
            </p>
          </div>

          <div className={styles.full}>
            <label>Business Address</label>
            <textarea
              value={profile.address}
              onChange={(e) =>
                setProfile({ ...profile, address: e.target.value })
              }
              placeholder="Your business address"
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.actions}>
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
