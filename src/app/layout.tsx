import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "callsheet — your shot list, written for you",
  description:
    "Brands post campaigns. Creators join and get an AI shot-by-shot brief — hook, shots, caption, hashtags. Then film it.",
  applicationName: "callsheet",
  appleWebApp: { capable: true, title: "callsheet", statusBarStyle: "black-translucent" },
  icons: { icon: "/icon-192.png", apple: "/apple-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`} style={{ background: "#000" }}>
        {children}
      </body>
    </html>
  );
}
