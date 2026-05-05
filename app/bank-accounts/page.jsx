"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import { getBankAccounts } from "../../services/vendorService";
import AppLayout from "../../components/AppLayout";

export default function BankAccountsPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    if (user) {
      fetchAccounts();
    }
  }, [user]);

  async function fetchAccounts() {
    try {
      const data = await getBankAccounts(user.uid);
      setAccounts(data);
    } catch (error) {
      console.error("Error fetching bank accounts:", error);
    }
  }

  return (
    <AppLayout>
      <div className="container" style={{ marginTop: "0" }}>
        <div className="card">
          <h1>Bank Accounts</h1>
          {accounts.length === 0 ? (
            <div>
              <p>No bank accounts added yet.</p>
              <Link href="/profile">
                <button className="button">Add Bank Account</button>
              </Link>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: "1rem" }}>
                <Link href="/profile">
                  <button className="button">Add New Bank Account</button>
                </Link>
              </div>
              <ul>
                {accounts.map((acc) => (
                  <li
                    key={acc.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "0.6rem",
                      padding: "0.5rem",
                      border: "1px solid #e2e8f0",
                      borderRadius: "0.375rem",
                    }}
                  >
                    <span>
                      {acc.bankName} - {acc.accountNumber} ({acc.accountName})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
