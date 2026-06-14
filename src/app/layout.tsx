import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/auth-provider";
import { SchemaMarkup } from "@/components/seo/schema-markup";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.elitehosting.in'),
  title: "EliteHosting — Premium Cloud Deployment Platform",
  description: "Highly advanced modern cloud deployment platform with Mumbai Edge Datacenter.",
  keywords: ["cloud hosting", "bot deploy", "Railway alternative", "Vercel alternative", "India hosting", "AI deployment"],
  authors: [{ name: "EliteHosting Team" }],
  openGraph: {
    title: "EliteHosting — Premium Cloud Deployment Platform",
    description: "Highly advanced modern cloud deployment platform.",
    url: "https://www.elitehosting.in",
    siteName: "EliteHosting",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EliteHosting — Premium Cloud Deployment Platform",
    description: "Highly advanced modern cloud deployment platform.",
    images: ["/logo.png"],
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link href="https://api.fontshare.com/v2/css?f[]=satoshi@700,500,400&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${inter.variable} antialiased bg-black text-white selection:bg-white/10 selection:text-white font-sans`}
      >
        <SchemaMarkup />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
