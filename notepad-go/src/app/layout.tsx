import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Notepad Go",
  description: "A simple notepad app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
