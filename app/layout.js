import "./globals.scss";
import Providers from "../components/Providers";
import Layout from "../components/Layout";

export const metadata = {
  title: "Vendor Invoice Dashboard",
  description: "Invoice app for vendors",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  );
}
