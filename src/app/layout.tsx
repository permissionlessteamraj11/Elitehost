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
  title: {
    default: "EliteHosting — Premium Cloud Deployment Platform",
    template: "%s | EliteHosting"
  },
  description: "EliteHosting is India's most advanced cloud deployment platform. Specialized in Telegram bot hosting with Mumbai Edge nodes, offering sub-5ms latency and 24/7 uptime.",
  keywords: [
    "Telegram bot hosting India",
    "Mumbai edge hosting",
    "best cloud platform India",
    "deploy Python bot",
    "Node.js bot hosting",
    "Railway alternative India",
    "EliteHosting",
    "EliteHost"
  ],
  authors: [{ name: "EliteHosting Team" }],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "EliteHosting — Premium Cloud Deployment Platform",
    description: "The fastest cloud deployment platform in India for Telegram bots and web apps.",
    url: "https://www.elitehosting.in",
    siteName: "EliteHosting",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "EliteHosting — Premium Cloud Deployment",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EliteHosting — #1 Telegram Bot Hosting in India",
    description: "Deploy Python and Node.js bots on Mumbai Edge nodes with 24/7 uptime.",
    images: ["/logo.png"],
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
