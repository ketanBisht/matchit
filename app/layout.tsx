import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300","400","500","600","700","900"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MatchIt — Color Memory Challenge",
  description: "Test your color memory. Memorize a color, then recreate it.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
