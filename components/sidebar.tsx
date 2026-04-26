'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, BarChart3, Map, Settings, Leaf, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const navItems = [
  { label: 'Dashboard', href: '/', icon: BarChart3 },
  { label: 'Fields', href: '/fields', icon: Map },
  { label: 'Analytics', href: '/analytics', icon: TrendingUp },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  const sidebarVariants: any = {
    hidden: { x: -300, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { x: -300, opacity: 0, transition: { duration: 0.2 } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={sidebarVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border shadow-xl z-40 pt-20"
        >
          {/* Close Button */}
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg transition-colors md:hidden"
          >
            <X className="w-5 h-5 text-foreground" />
          </motion.button>

          {/* Logo Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="px-6 mb-8"
          >
            <div className="flex items-center gap-2">
              <Leaf className="w-6 h-6 text-primary" />
              <h2 className="text-lg font-bold text-primary">AgroInsight</h2>
            </div>
          </motion.div>

          {/* Navigation Items */}
          <nav className="px-4 space-y-2">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <Link href={item.href}>
                    <motion.div
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-lg'
                          : 'text-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="ml-auto w-1 h-6 bg-primary-foreground rounded-full"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* Footer Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute bottom-6 left-0 right-0 px-4"
          >
            <div className="p-4 bg-muted rounded-lg border border-border text-center">
              <p className="text-sm text-muted-foreground">
                Farm Status: <span className="text-primary font-semibold">Optimal</span>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
