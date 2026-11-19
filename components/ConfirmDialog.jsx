"use client";

import { AlertTriangle, X } from "lucide-react";
import styles from "./ConfirmDialog.module.scss";

export default function ConfirmDialog({
  open,
  title,
  message,
  itemLabel,
  warning = "This action is permanent and cannot be undone.",
  confirmLabel = "Delete",
  loadingLabel = "Deleting...",
  cancelLabel = "Cancel",
  loading = false,
  error = "",
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className={styles.dialog}>
        <button
          type="button"
          className={styles.closeButton}
          onClick={onCancel}
          disabled={loading}
          aria-label="Close"
        >
          <X size={22} />
        </button>

        <div className={styles.body}>
          <div className={styles.iconWrap}>
            <AlertTriangle size={26} />
          </div>

          <h2 id="confirm-dialog-title">{title}</h2>

          {message && <p className={styles.message}>{message}</p>}

          {itemLabel && <div className={styles.itemLabel}>{itemLabel}</div>}

          <div className={styles.warning}>
            <AlertTriangle size={16} />
            <span>{warning}</span>
          </div>

          {error && <div className={styles.error}>{error}</div>}
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            className={styles.confirmButton}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? loadingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
