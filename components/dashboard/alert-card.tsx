'use client';

import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { useState } from 'react';

interface AlertCardProps {
  title: string;
  message: string;
  type?: 'warning' | 'success' | 'info' | 'error';
  dismissible?: boolean;
  delay?: number;
}

const typeStyles = {
  warning: {
    bg: 'bg-[#ff9f43]/10',
    border: 'border-[#ff9f43]/30',
    icon: AlertCircle,
    iconColor: 'text-[#ff9f43]',
    titleColor: 'text-[#ff9f43]',
  },
  success: {
    bg: 'bg-[#00d084]/10',
    border: 'border-[#00d084]/30',
    icon: CheckCircle,
    iconColor: 'text-[#00d084]',
    titleColor: 'text-[#00d084]',
  },
  info: {
    bg: 'bg-[#00b4d8]/10',
    border: 'border-[#00b4d8]/30',
    icon: Info,
    iconColor: 'text-[#00b4d8]',
    titleColor: 'text-[#00b4d8]',
  },
  error: {
    bg: 'bg-[#ff6b6b]/10',
    border: 'border-[#ff6b6b]/30',
    icon: AlertCircle,
    iconColor: 'text-[#ff6b6b]',
    titleColor: 'text-[#ff6b6b]',
  },
};

export function AlertCard({
  title,
  message,
  type = 'info',
  dismissible = true,
  delay = 0,
}: AlertCardProps) {
  const [isVisible, setIsVisible] = useState(true);
  const styles = typeStyles[type];
  const Icon = styles.icon;

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, delay }}
      className={`${styles.bg} border ${styles.border} rounded-lg p-4 flex gap-4 items-start`}
    >
      {/* Icon with pulse animation */}
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className={`flex-shrink-0 ${styles.iconColor}`}
      >
        <Icon className="w-5 h-5" />
      </motion.div>

      {/* Content */}
      <div className="flex-1">
        <motion.h4
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.1 }}
          className={`font-semibold text-sm ${styles.titleColor}`}
        >
          {title}
        </motion.h4>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.15 }}
          className="text-sm text-foreground/80 mt-1"
        >
          {message}
        </motion.p>
      </div>

      {/* Close Button */}
      {dismissible && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsVisible(false)}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </motion.button>
      )}
    </motion.div>
  );
}
