import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CrossPay - Digital Subscription Marketplace (Nepal)",
  description: "Access global subscription services from Nepal using local payment methods like eSewa. The first digital marketplace for cross-border subscriptions.",
  keywords: ["CrossPay", "Nepal", "subscriptions", "eSewa", "Stripe", "digital marketplace", "cross-border payments"],
  authors: [{ name: "CrossPay Team" }],
  openGraph: {
    title: "CrossPay - Access Global Subscriptions from Nepal",
    description: "Pay for international services using local payment methods like eSewa.",
    type: "website",
    locale: "en_NP",
  },
  twitter: {
    card: "summary_large_image",
    title: "CrossPay - Access Global Subscriptions from Nepal",
    description: "Pay for international services using local payment methods like eSewa.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
