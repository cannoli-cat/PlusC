import type { Metadata, Viewport } from "next";
import { EB_Garamond, JetBrains_Mono } from "next/font/google";
import { Analytics } from '@vercel/analytics/react'
import "./globals.css";

const garamond = EB_Garamond({
  variable: "--font-garamond",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "Plus C",
  description: "A calculus study tool by Tyler Wolfe",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${garamond.variable} ${jetbrains.variable}`}>
      <body>{children}<Analytics /></body>
    </html>
  );
}