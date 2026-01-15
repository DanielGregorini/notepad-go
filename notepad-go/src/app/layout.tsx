import type { Metadata } from "next";
import "./globals.css";

import Footer from "@/components/ui/footer";  
import Header from "@/components/ui/header";

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
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
