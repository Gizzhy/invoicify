"use client";

import { useEffect, useRef, useState } from "react";
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
  const LOGO_MAX_BYTES = 2 * 1024 * 1024;
  const [profile, setProfile] = useState({
    brandName: "",
    brandDesc: "",
    address: "",
    phone: "",
    logoUrl: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const previewUrlRef = useRef("");

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  // Release the object URL for any staged preview on unmount.
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

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
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      // The logo is uploaded here rather than on selection, so a file is
      // only stored once the profile that references it is saved.
      let logoUrl = profile.logoUrl;

      if (logoFile) {
        logoUrl = await uploadLogo(user.uid, logoFile);
      }

      await updateVendorProfile(user.uid, { ...profile, logoUrl });

      setProfile((prev) => ({ ...prev, logoUrl }));
      setLogoFile(null);
      clearPreview();
      setSuccess("Changes saved.");
    } catch (err) {
      console.error("Error saving profile:", err);
      setError(
        logoFile
          ? "Failed to save your profile. The logo may not have uploaded."
          : "Failed to update profile",
      );
    } finally {
      setSaving(false);
    }
  }

  function clearPreview() {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = "";
    }
    setLogoPreview("");
  }

  function onLogoChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    setError("");
    setSuccess("");

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    if (file.size > LOGO_MAX_BYTES) {
      setError("That logo is larger than 2MB. Please choose a smaller image.");
      return;
    }

    clearPreview();

    const url = URL.createObjectURL(file);
    previewUrlRef.current = url;
    setLogoPreview(url);
    setLogoFile(file);
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

        <form
          onSubmit={updateProfile}
          className={styles.card}
          onChange={() => setSuccess("")}
        >
          {/* LOGO */}
          <div className={styles.logoSection}>
            <label>Company Logo</label>

            <div className={styles.logoUpload}>
              <input type="file" accept="image/*" onChange={onLogoChange} />

              {logoPreview || profile.logoUrl ? (
                <img src={logoPreview || profile.logoUrl} alt="logo" />
              ) : (
                <span>Click to upload or drag image</span>
              )}
            </div>

            {logoFile && (
              <p className={styles.logoHint}>
                New logo selected &mdash; save changes to upload it.
              </p>
            )}
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
          {success && <div className={styles.success}>{success}</div>}

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
