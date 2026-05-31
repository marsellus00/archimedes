import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Engineering GPT",
  description: "Engineering solutions workspace proof of concept",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}