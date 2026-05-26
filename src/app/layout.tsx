import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/auth-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "EliteHost — Premium Cloud Deployment Platform",
  description: "Highly advanced modern cloud deployment platform.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "EliteHost",
  },
};

export const viewport: Viewport = {
  themeColor: "#020108",
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
      <body
        className={`${inter.variable} ${poppins.variable} antialiased bg-[#020108] text-white selection:bg-[#00E5FF]/30 selection:text-[#00E5FF]`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
