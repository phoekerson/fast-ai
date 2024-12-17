import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import {dark} from "@clerk/themes"
import {Inter} from 'next/font/google'

const inter = Inter({ subsets: ["latin"]})

export const metadata: Metadata = {
  title: "FastAI",
  description: "Post every day, Post every time",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body
       className={`${inter.className} bg-black text-white antialiased`}
      >
        {children}
      </body>
    </html>
    </ClerkProvider>
  );
}
