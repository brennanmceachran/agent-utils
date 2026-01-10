import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";

import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const metadataBaseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://brennanmceachran.github.io";

export const metadata: Metadata = {
  metadataBase: new URL(metadataBaseUrl),
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
      <body className={`${spaceGrotesk.variable} ${jetBrainsMono.variable} min-h-full font-sans`}>
        {children}
      </body>
    </html>
  );
}
