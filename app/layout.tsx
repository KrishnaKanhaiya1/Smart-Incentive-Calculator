import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Smart Incentive Calculator",
  description: "Calculate tiered monthly incentives for vehicle sales officers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
