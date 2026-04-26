'use client';

import { motion } from 'framer-motion';
import React from 'react';

type Direction = 'up' | 'down' | 'left' | 'right';

interface SlideInProps {
  children: React.ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  className?: string;
}

const directionValues: Record<Direction, { x?: number; y?: number }> = {
  up: { y: 20 },
  down: { y: -20 },
  left: { x: -20 },
  right: { x: 20 },
};

export function SlideIn({ 
  children, 
  direction = 'up',
  delay = 0,
  duration = 0.6,
  className = ''
}: SlideInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, ...directionValues[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
