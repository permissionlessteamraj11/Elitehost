"use client";

import { MobileBottomNav } from "@/components/dashboard/mobile-bottom-nav";
import { AppHeader } from "@/components/dashboard/app-header";
import { Sidebar } from "@/components/dashboard/sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { FloatingActionButton } from "@/components/ui/floating-action-button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[#020108] text-white selection:bg-electric/30 overflow-x-hidden">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Sidebar for Desktop */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen relative pb-32 lg:pb-8">
        <AppHeader />

        <main id="main-content" className="flex-1 px-4 py-6 lg:px-8 max-w-7xl mx-auto w-full overflow-x-hidden outline-none" tabIndex={-1}>
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        <FloatingActionButton href="/dashboard/new" />
        <MobileBottomNav />

        {/* Pull to refresh visual hint */}
        <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-electric/50 to-transparent opacity-0 pointer-events-none active:opacity-100 transition-opacity z-50 lg:hidden" />
      </div>
    </div>
  );
}
