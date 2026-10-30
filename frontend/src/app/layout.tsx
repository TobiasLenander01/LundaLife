import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: "LundaLife",
  description: "What's on at the student nations in Lund. Made by Tobias Lenander and Victor Karlström",
};

export const viewport: Viewport = {
  themeColor: "#0c253e",
  // Draw behind the iPhone notch and home indicator; safe areas are handled with env(safe-area-inset-*)
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="font-sans">
        {children}
      </body>
    </html>
  );
}
