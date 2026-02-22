import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bab Marrakech — Authentic Moroccan Cuisine in Ottawa",
  description:
    "Experience the warmth of Morocco in the heart of Ottawa. Authentic tagines, couscous, and the rich flavors of North Africa at Bab Marrakech.",
  keywords: [
    "Moroccan restaurant",
    "Ottawa",
    "tagine",
    "couscous",
    "halal",
    "Bab Marrakech",
    "North African cuisine",
  ],
  openGraph: {
    title: "Bab Marrakech — Authentic Moroccan Cuisine in Ottawa",
    description:
      "Where the warmth of Morocco meets the heart of Ottawa. Experience authentic tagines, couscous, and rich North African flavors.",
    type: "website",
    locale: "en_CA",
  },
  icons: {
    icon: "/bmfavicon.svg",
    apple: "/babmarrakechlogo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${playfair.variable} ${inter.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
