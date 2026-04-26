'use client';

import { motion } from 'framer-motion';
import { Menu, Bell, Settings, User } from 'lucide-react';
import { FadeIn } from './animations/fade-in';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <FadeIn duration={0.5}>
      <motion.header
        className="sticky top-0 z-50 bg-background border-b border-border"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <motion.button
                onClick={onMenuClick}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6 text-primary" />
              </motion.button>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <h1 className="text-2xl font-bold text-primary">AgroInsight</h1>
              </motion.div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              {/* Notification Bell */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 hover:bg-muted rounded-lg transition-colors relative"
              >
                <Bell className="w-5 h-5 text-foreground" />
                <motion.span
                  className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full animate-pulse"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                />
              </motion.button>

              {/* Settings */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 20 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5 text-foreground" />
              </motion.button>

              {/* User Profile */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <User className="w-5 h-5 text-foreground" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>
    </FadeIn>
  );
}
