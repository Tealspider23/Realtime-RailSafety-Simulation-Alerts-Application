import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"],
 weight:['100','200','300','400','500','600','800']
 });

export const metadata: Metadata = {
  title: "Rail-safe App",
  description: "Real-time Simulation of Trains to prevent Accidents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={jetbrainsMono.className}>
        <Navbar />
        {children}</body>
    </html>
  );
}