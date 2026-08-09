import type { Metadata } from "next";
import { Inter, Space_Grotesk, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CompareProvider } from "@/context/CompareContext";
import { WishlistProvider } from "@/context/WishlistContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CompareTray from "@/components/CompareTray";
import ScrollRestoration from "@/components/ScrollRestoration";
import { Suspense } from "react";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TrueSpecs | Product Comparison & Review",
  description: "Check genuine specs, side-by-side comparisons, Specs Score, and camera samples with zero bugs.",
};

import { ThemeProvider } from "@/context/ThemeContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-theme-app text-theme-primary selection:bg-accent/30 selection:text-theme-primary transition-colors duration-200">
        <ThemeProvider>
          <WishlistProvider>
            <CompareProvider>
              <Suspense fallback={<div className="h-16 bg-theme-elevated border-b border-theme"></div>}>
                <Navbar />
              </Suspense>
              <Suspense fallback={null}>
                <ScrollRestoration>
                  <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 sm:pb-28">
                    {children}
                  </main>
                </ScrollRestoration>
              </Suspense>
              <CompareTray />
              <Footer />
            </CompareProvider>
          </WishlistProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
