import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";

import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Agent Utils Registry",
  description: "Index-ready registry of OpenCode agent utilities with install-ready files.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${spaceGrotesk.variable} min-h-full font-sans`}>{children}</body>
    </html>
  );
}
