"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  BarChart3, 
  Sprout, 
  Leaf, 
  Users, 
  LogOut, 
  Bell, 
  Settings, 
  Menu, 
  X,
  ChevronRight,
  ShoppingBag
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
}

export default function FloatingNavbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  // Listen to scroll to update morph state
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 30);
  });

  // Close mobile menu on page transition
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navItems: NavItem[] = [
    { name: "Dashboard", href: "/", icon: BarChart3 },
    { name: "Crop Advisor", href: "/crop-recommendation", icon: Sprout },
    { name: "Community", href: "/community", icon: Users },
    { name: "AgriMarket", href: "/market", icon: ShoppingBag },
  ];

  // Mobile menu variants
  const menuVariants = {
    closed: {
      opacity: 0,
      y: "-100%",
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 250,
        damping: 25,
        staggerChildren: 0.07,
        delayChildren: 0.1
      }
    }
  };

  const menuItemVariants = {
    closed: { opacity: 0, x: -20 },
    open: { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 300, damping: 20 } }
  };

  return (
    <>
      <motion.nav
        style={{ left: "50%", x: "-50%" }}
        initial={{ y: -100, x: "-50%" }}
        animate={{
          y: 0,
          top: isScrolled ? "16px" : "0px",
          width: isScrolled ? "92%" : "100%",
          maxWidth: isScrolled ? "1280px" : "100%",
          borderRadius: isScrolled ? "9999px" : "0px",
          backgroundColor: isScrolled ? "rgba(10, 10, 26, 0.75)" : "rgba(10, 10, 10, 0.4)",
          borderColor: isScrolled ? "rgba(0, 208, 132, 0.3)" : "rgba(255, 255, 255, 0.05)",
          borderWidth: isScrolled ? "1.5px" : "0px 0px 1px 0px",
          paddingLeft: isScrolled ? "28px" : "32px",
          paddingRight: isScrolled ? "28px" : "32px",
          height: isScrolled ? "68px" : "80px",
          boxShadow: isScrolled 
            ? "0 20px 40px rgba(0, 0, 0, 0.8), 0 0 15px rgba(0, 208, 132, 0.15), inset 0 1px 0px rgba(255, 255, 255, 0.1)" 
            : "0 4px 20px rgba(0, 0, 0, 0.2)",
        }}
        transition={{
          type: "spring",
          stiffness: 220,
          damping: 26,
          mass: 1
        }}
        className="fixed z-50 flex items-center justify-between backdrop-blur-xl border-solid transition-shadow duration-300"
      >
        {/* Cyberpunk Grid / Corner accents on floating navbar */}
        {isScrolled && (
          <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
            {/* Tech line accents */}
            <div className="absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            <div className="absolute bottom-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
          </div>
        )}

        {/* Left Side: Logo & Cyber Decoration */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              {/* Pulsating Logo Glow */}
              <div className="absolute inset-0 bg-primary/40 rounded-xl blur-lg group-hover:bg-primary/70 transition-all duration-300" />
              <motion.div 
                className="relative bg-gradient-to-br from-primary to-accent p-2 rounded-xl border border-white/10 shadow-[0_0_15px_rgba(0,208,132,0.2)]"
                whileHover={{ rotate: 180, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Leaf className="w-5 h-5 text-black" />
              </motion.div>
            </div>
            
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-white leading-none">
                Agro<span className="text-primary">Insight</span>
              </span>
              <span className="text-[9px] tracking-widest text-muted-foreground uppercase mt-0.5 font-mono hidden sm:inline-block">
                SYS_ACTIVE // v1.2
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Navigation Links (Desktop) */}
        <div className="hidden lg:flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/5 backdrop-blur-md relative">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onMouseEnter={() => setHoveredIdx(index)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={`relative px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-300 group flex items-center gap-2 select-none cursor-pointer ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-white"
                }`}
              >
                {/* Dynamic Sliding Hover Pill */}
                {hoveredIdx === index && (
                  <motion.div
                    layoutId="nav-hover-pill"
                    className="absolute inset-0 bg-white/10 rounded-full border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] -z-10"
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}

                <item.icon className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-white"}`} />
                <span>{item.name}</span>

                {/* Cyberpunk dot indicator for active tab */}
                {isActive && (
                  <motion.span
                    layoutId="active-dot"
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary shadow-[0_0_8px_rgba(0,208,132,0.8)]"
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right Side: Auth State / Glowing CTA Button */}
        <div className="flex items-center gap-4">
          {/* Notifications & Settings Quick Links (Desktop) */}
          <div className="hidden md:flex items-center gap-2 border-r border-white/10 pr-4">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full hover:bg-white/5 text-muted-foreground hover:text-white transition-colors relative group"
            >
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-accent rounded-full border border-background shadow-[0_0_8px_rgba(0,180,216,0.8)]" />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05, rotate: 20 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full hover:bg-white/5 text-muted-foreground hover:text-white transition-colors"
            >
              <Settings className="w-4.5 h-4.5" />
            </motion.button>
          </div>

          {user ? (
            /* Logged In State */
            <div className="flex items-center gap-2">
              <Link 
                href="/profile" 
                className="flex items-center gap-2.5 bg-white/5 hover:bg-white/10 p-1.5 pr-3 rounded-full transition-all cursor-pointer border border-white/5 hover:border-primary/30 group"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center font-bold text-white overflow-hidden border border-white/10 group-hover:border-primary/50 transition-colors">
                  {user.profile_image ? (
                    <img src={`http://127.0.0.1:8000${user.profile_image}`} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="hidden sm:block text-left text-xs">
                  <p className="font-semibold text-white leading-tight">{user.name}</p>
                  <p className="text-[10px] text-muted-foreground">{user.region || "Farmer"}</p>
                </div>
              </Link>
              <motion.button 
                onClick={logout} 
                whileHover={{ scale: 1.05, backgroundColor: "rgba(239, 68, 68, 0.1)" }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer border border-transparent hover:border-destructive/20"
                title="Logout"
              >
                <LogOut className="w-4.5 h-4.5" />
              </motion.button>
            </div>
          ) : (
            /* Logged Out State with Glowing Cyber CTA */
            <div className="flex items-center gap-4">
              <Link href="/login" className="hidden sm:block text-sm font-semibold text-muted-foreground hover:text-white transition-colors">
                Sign In
              </Link>
              <Link href="/signup" className="relative group">
                {/* Background glow backplate */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-full blur-md opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
                
                <button className="relative px-5 py-2.5 bg-black rounded-full text-white text-xs font-bold uppercase tracking-wider transition-all duration-300 group-hover:bg-transparent group-hover:text-black flex items-center gap-1.5 border border-white/10 group-hover:border-transparent select-none cursor-pointer">
                  <span>Join Agro</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-full bg-white/5 hover:bg-white/10 text-white cursor-pointer border border-white/5 hover:border-primary/20 flex items-center justify-center"
          >
            <AnimatePresence mode="wait">
              {mobileMenuOpen ? (
                <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                  <X className="w-5 h-5 text-accent" />
                </motion.div>
              ) : (
                <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                  <Menu className="w-5 h-5 text-primary" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.nav>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Dark glass backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/85 backdrop-blur-2xl"
            />

            {/* Mobile Drawer Panel */}
            <motion.div
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed inset-x-0 top-0 z-45 bg-gradient-to-b from-[#06060c] to-[#0d0d1e] border-b border-primary/20 pt-28 pb-10 px-6 max-h-[85vh] overflow-y-auto shadow-[0_25px_50px_rgba(0,0,0,0.9)] rounded-b-[2rem]"
            >
              {/* Cyber HUD visual lines */}
              <div className="absolute top-24 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              
              <div className="max-w-md mx-auto space-y-8">
                {/* Drawer Menu Title */}
                <div className="flex justify-between items-center px-2">
                  <span className="text-[10px] font-mono tracking-widest text-primary uppercase">
                    [NAVIGATIONAL_ARRAY]
                  </span>
                  <span className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase">
                    ONLINE
                  </span>
                </div>

                {/* Nav Links */}
                <nav className="flex flex-col gap-3">
                  {navItems.map((item, idx) => {
                    const isActive = pathname === item.href;
                    return (
                      <motion.div key={item.name} variants={menuItemVariants}>
                        <Link 
                          href={item.href}
                          className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                            isActive 
                              ? "bg-primary/10 border-primary/40 text-primary shadow-[0_0_15px_rgba(0,208,132,0.1)]" 
                              : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10 hover:border-white/10 hover:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                            <span className="font-bold text-base">{item.name}</span>
                          </div>
                          <ChevronRight className={`w-4 h-4 opacity-50 ${isActive ? "text-primary" : ""}`} />
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>

                <div className="h-[1px] bg-white/10" />

                {/* Auth/Mobile CTA Bottom */}
                <motion.div variants={menuItemVariants} className="pt-2">
                  {user ? (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center font-bold text-white overflow-hidden border border-white/10">
                          {user.profile_image ? (
                            <img src={`http://127.0.0.1:8000${user.profile_image}`} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            user.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.region || "Global"}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <Link href="/profile" className="w-full">
                          <button className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl font-semibold text-sm border border-white/10 transition-colors select-none cursor-pointer">
                            View Profile
                          </button>
                        </Link>
                        <button 
                          onClick={logout}
                          className="w-full py-3 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-xl font-semibold text-sm border border-destructive/20 transition-colors select-none cursor-pointer"
                        >
                          Log Out
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Link href="/login" className="w-full">
                          <button className="w-full py-3.5 bg-white/5 hover:bg-white/10 rounded-xl font-semibold text-sm border border-white/10 transition-colors select-none cursor-pointer">
                            Sign In
                          </button>
                        </Link>
                        <Link href="/signup" className="w-full">
                          <button className="w-full py-3.5 bg-primary hover:bg-primary/95 text-black rounded-xl font-bold text-sm transition-colors shadow-[0_0_15px_rgba(0,208,132,0.3)] select-none cursor-pointer">
                            Get Started
                          </button>
                        </Link>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
