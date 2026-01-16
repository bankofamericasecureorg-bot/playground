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
  title: "Bank of America - Online Banking",
  description: "Access your Bank of America accounts securely. View balances, transfer funds, pay bills, and manage your finances online.",
  keywords: ["Bank of America", "online banking", "banking", "finance", "accounts"],
  authors: [{ name: "Bank of America" }],
  openGraph: {
    title: "Bank of America - Online Banking",
    description: "Secure online banking with Bank of America",
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
        <link rel="icon" href="/favicon.ico" sizes="any" />
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
