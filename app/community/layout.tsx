"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Users, Home } from "lucide-react";

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a1a] text-foreground flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a1a]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <motion.button
                whileHover={{ x: -5 }}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2 text-muted-foreground hover:text-white"
              >
                <Home className="w-5 h-5" />
                <span className="hidden sm:inline font-medium">Dashboard</span>
              </motion.button>
            </Link>
            <div className="w-px h-6 bg-white/10 mx-2" />
            <div className="flex items-center gap-2 text-primary font-bold text-lg">
              <Users className="w-6 h-6" />
              <span>AgroCommunity</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/community">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-colors"
              >
                Explore Communities
              </motion.button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 pointer-events-none fixed">
          <motion.div
            className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]"
            animate={{ x: [0, 50, 0], y: [0, -50, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px]"
            animate={{ x: [0, -50, 0], y: [0, 50, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
