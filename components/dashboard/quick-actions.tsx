'use client';

import { motion } from 'framer-motion';
import { Cloud, Droplets, Bug, RefreshCw, Settings, Download } from 'lucide-react';
import { HoverScale } from '../animations/hover-scale';

const actions = [
  {
    label: 'Weather Update',
    icon: Cloud,
    color: 'bg-[#00b4d8]',
    hover: 'hover:bg-[#00b4d8]/20',
  },
  {
    label: 'Irrigation Control',
    icon: Droplets,
    color: 'bg-[#00d084]',
    hover: 'hover:bg-[#00d084]/20',
  },
  {
    label: 'Pest Alert',
    icon: Bug,
    color: 'bg-[#ff9f43]',
    hover: 'hover:bg-[#ff9f43]/20',
  },
  {
    label: 'Refresh Data',
    icon: RefreshCw,
    color: 'bg-[#7b2cbf]',
    hover: 'hover:bg-[#7b2cbf]/20',
  },
  {
    label: 'Settings',
    icon: Settings,
    color: 'bg-[#ff6b6b]',
    hover: 'hover:bg-[#ff6b6b]/20',
  },
  {
    label: 'Export Data',
    icon: Download,
    color: 'bg-[#00d084]',
    hover: 'hover:bg-[#00d084]/20',
  },
];

interface QuickActionsProps {
  delay?: number;
}

export function QuickActions({ delay = 0 }: QuickActionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="space-y-4"
    >
      <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <HoverScale key={action.label} scale={1.1}>
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: delay + index * 0.05 }}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.95 }}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border border-border bg-card transition-all duration-300 ${action.hover} group`}
              >
                <motion.div
                  whileHover={{ rotate: 20 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="mb-2"
                >
                  <Icon className="w-6 h-6 text-foreground group-hover:text-primary transition-colors" />
                </motion.div>
                <span className="text-xs text-center text-muted-foreground group-hover:text-foreground transition-colors font-medium">
                  {action.label}
                </span>
              </motion.button>
            </HoverScale>
          );
        })}
      </div>
    </motion.div>
  );
}
