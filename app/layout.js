import "./globals.scss";
import Providers from "../components/Providers";

export const metadata = {
  title: "Invoicify - Smarter Invoicing for Everyone",
  description:
    "Everything you need to invoice smarter—create, send, and track payments effortlessly across currencies.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
