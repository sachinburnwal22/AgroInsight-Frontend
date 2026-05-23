"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CroppingPatternsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/crop-recommendation");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#06060c] flex items-center justify-center text-slate-400 font-mono text-xs uppercase tracking-widest">
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        <span>Redirecting to Advisor...</span>
      </div>
    </div>
  );
}
