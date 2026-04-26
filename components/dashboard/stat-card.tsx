'use client';

import { motion } from 'framer-motion';
import { HoverScale } from '../animations/hover-scale';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'accent' | 'secondary';
  delay?: number;
}

const colorStyles = {
  primary: {
    bg: 'bg-gradient-to-br from-[#00d084]/10 to-[#00d084]/5',
    border: 'border-primary/30',
    icon: 'text-primary',
    accent: 'text-primary',
  },
  accent: {
    bg: 'bg-gradient-to-br from-[#00b4d8]/10 to-[#00b4d8]/5',
    border: 'border-accent/30',
    icon: 'text-accent',
    accent: 'text-accent',
  },
  secondary: {
    bg: 'bg-gradient-to-br from-[#7b2cbf]/10 to-[#7b2cbf]/5',
    border: 'border-secondary/30',
    icon: 'text-secondary',
    accent: 'text-secondary',
  },
};

export function StatCard({
  title,
  value,
  unit = '',
  icon: Icon,
  trend,
  color = 'primary',
  delay = 0,
}: StatCardProps) {
  const styles = colorStyles[color];

  const getGradientColor = () => {
    switch(color) {
      case 'primary': return 'from-[#00d084]/5 to-transparent';
      case 'accent': return 'from-[#00b4d8]/5 to-transparent';
      case 'secondary': return 'from-[#7b2cbf]/5 to-transparent';
      default: return 'from-[#00d084]/5 to-transparent';
    }
  };

  return (
    <HoverScale scale={1.05}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay, ease: 'easeOut' }}
        className={`${styles.bg} border ${styles.border} rounded-xl p-6 backdrop-blur-sm overflow-hidden relative group cursor-pointer`}
      >
        {/* Background Gradient Blur */}
        <motion.div
          className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${getGradientColor()}`}
          animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
          transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
        />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 10 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className={`p-3 rounded-lg bg-card border border-border ${styles.icon}`}
            >
              <Icon className="w-6 h-6" />
            </motion.div>
          </div>

          {/* Title */}
          <p className="text-sm text-muted-foreground font-medium mb-2">{title}</p>

          {/* Value */}
          <div className="flex items-baseline gap-1 mb-3">
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: delay + 0.2 }}
              className={`text-3xl font-bold ${styles.accent}`}
            >
              {value}
            </motion.span>
            {unit && (
              <span className="text-sm text-muted-foreground font-medium">{unit}</span>
            )}
          </div>

          {/* Trend */}
          {trend && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + 0.3 }}
              className={`text-xs font-semibold ${
                trend.isPositive ? 'text-primary' : 'text-destructive'
              }`}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from last month
            </motion.div>
          )}
        </div>
      </motion.div>
    </HoverScale>
  );
}
