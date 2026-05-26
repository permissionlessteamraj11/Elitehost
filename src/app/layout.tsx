import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/auth-provider";

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
  themeColor: "#0B0F19",
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
        className={`${inter.variable} antialiased bg-[#0B0F19] text-[#F9FAFB] selection:bg-[#6366F1]/30 selection:text-[#6366F1] font-sans`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
