import "./globals.scss";
import Providers from "../components/Providers";

export const metadata = {
  title: "Vendor Invoice Dashboard",
  description: "Invoice app for vendors",
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
