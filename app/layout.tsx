import type { Metadata } from "next";
import "./globals.css";

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
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}
