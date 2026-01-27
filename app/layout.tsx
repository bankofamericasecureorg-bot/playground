import type { Metadata } from "next";
import { Roboto, Libre_Franklin, Roboto_Mono } from "next/font/google";
import "./globals.css";

// Body font
const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

// Headings font (Franklin Gothic alternative)
const libreFranklin = Libre_Franklin({
  variable: "--font-libre-franklin",
  subsets: ["latin"],
  display: "swap",
});

// Monospace font for numbers/balances
const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Radius Wealth Partners | Strategic Asset Management",
  description: "Premier wealth management and strategic advisory services for high-net-worth individuals and families. Preserving legacy for future generations.",
  keywords: ["wealth management", "asset management", "financial advisory", "investment strategy", "private wealth"],
  authors: [{ name: "Radius Wealth Partners" }],
  openGraph: {
    title: "Radius Wealth Partners | Strategic Asset Management",
    description: "Premier wealth management and strategic advisory services.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#012169" />
      </head>
      <body 
        className={`${roboto.variable} ${libreFranklin.variable} ${robotoMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
