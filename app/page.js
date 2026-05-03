import Link from "next/link";

export default function Home() {
  return (
    <main className="container card" style={{ marginTop: "3rem" }}>
      <h1>Vendor Invoice App</h1>
      <p>Sign in or sign up to start creating invoices.</p>
      <div style={{ display: "flex", gap: "0.8rem" }}>
        <Link href="/login">
          <button className="button">Login</button>
        </Link>
        <Link href="/signup">
          <button className="button">Sign up</button>
        </Link>
      </div>
    </main>
  );
}
