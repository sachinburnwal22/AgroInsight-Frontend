"use client";

import { usePathname } from "next/navigation";

export default function BackgroundWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <>
      {/* Global Background Image (Hidden on Homepage since it uses a video) */}
      {!isHomePage && (
        <div className="fixed inset-0 z-[-1] bg-[url('/premium_background.png')] bg-cover bg-center bg-fixed bg-no-repeat">
          {/* Subtle overlay to ensure text readability */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px]" />
        </div>
      )}
      
      {/* Main Content */}
      <div className="relative z-0">
        {children}
      </div>
    </>
  );
}
