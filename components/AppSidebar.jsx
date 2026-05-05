"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { logout } from "../services/authService";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Landmark,
  User,
  LogOut,
  WalletCards,
} from "lucide-react";
import styles from "./AppSidebar.module.scss";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/bank-accounts", label: "Bank Accounts", icon: WalletCards },
  { href: "/profile", label: "Profile", icon: User },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.brand}>
        <h2>Invoicify</h2>
      </div>
      <nav className={styles.nav}>
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`${styles.navItem} ${
              pathname === href ? styles.active : ""
            }`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
      <div className={styles.logout}>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
