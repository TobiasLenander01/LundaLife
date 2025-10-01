import type { Metadata } from "next";
import "./globals.css";

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
      <body>
        <div className="relative min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}