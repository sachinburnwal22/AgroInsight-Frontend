'use client';

import { motion } from 'framer-motion';
import React from 'react';

interface HoverScaleProps {
  children: React.ReactNode;
  scale?: number;
  duration?: number;
  className?: string;
}

export function HoverScale({ 
  children, 
  scale = 1.05,
  duration = 0.3,
  className = ''
}: HoverScaleProps) {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: scale * 0.98 }}
      transition={{ duration, ease: 'easeInOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
