import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { THEME_SCRIPT } from "@/lib/themeScript";
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0c253e" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
  // Draw behind the iPhone notch and home indicator; safe areas are handled with env(safe-area-inset-*)
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The theme script adds the "dark" class before React loads, so hydration warnings are expected here
    <html lang="en" className={geist.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="font-sans">
        {children}
      </body>
    </html>
  );
}
