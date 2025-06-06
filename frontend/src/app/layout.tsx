import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Searchbar from "@/components/Searchbar"
import Navbar from "@/components/Navbar";
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
  title: "LundaLife",
  description: "Made by Tobias Lenander and Victor Karlström",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="relative min-h-screen pb-14">
          <Searchbar />
          {children}
          <Navbar/>
        </div>
      </body>
    </html>
  );
}