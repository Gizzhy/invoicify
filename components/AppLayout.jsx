"use client";

import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AppSidebar from "./AppSidebar";

export default function AppLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div style={{ display: "flex" }}>
      <AppSidebar />
      <main
        style={{
          flex: 1,
          marginLeft: "250px",
          padding: "2rem",
          backgroundColor: "#f9fafb",
          minHeight: "100vh",
        }}
      >
        {children}
      </main>
    </div>
  );
}
