'use client';

import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { HoverScale } from '../animations/hover-scale';

const yieldData = [
  { month: 'Jan', yield: 4.5, moisture: 60, temp: 22 },
  { month: 'Feb', yield: 5.2, moisture: 65, temp: 24 },
  { month: 'Mar', yield: 6.1, moisture: 70, temp: 26 },
  { month: 'Apr', yield: 7.8, moisture: 72, temp: 28 },
  { month: 'May', yield: 8.5, moisture: 75, temp: 30 },
  { month: 'Jun', yield: 9.2, moisture: 70, temp: 32 },
  { month: 'Jul', yield: 8.8, moisture: 65, temp: 31 },
];

interface ChartSectionProps {
  title: string;
  type: 'line' | 'bar';
  delay?: number;
}

export function ChartSection({ title, type = 'line', delay = 0 }: ChartSectionProps) {
  return (
    <HoverScale>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay, ease: 'easeOut' }}
        className="bg-card border border-border rounded-xl p-6 backdrop-blur-sm"
      >
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.1 }}
          className="text-lg font-semibold text-foreground mb-6"
        >
          {title}
        </motion.h3>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.2 }}
          className="w-full h-80"
        >
          <ResponsiveContainer width="100%" height="100%">
            {type === 'line' ? (
              <LineChart data={yieldData}>
                <defs>
                  <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d084" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#00d084" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a2e',
                    border: '1px solid rgba(0,208,132,0.3)',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="yield"
                  stroke="#00d084"
                  strokeWidth={2}
                  dot={{ fill: '#00d084', r: 4 }}
                  activeDot={{ r: 6 }}
                  isAnimationActive={true}
                />
                <Line
                  type="monotone"
                  dataKey="moisture"
                  stroke="#00b4d8"
                  strokeWidth={2}
                  dot={{ fill: '#00b4d8', r: 4 }}
                  activeDot={{ r: 6 }}
                  isAnimationActive={true}
                />
              </LineChart>
            ) : (
              <BarChart data={yieldData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a2e',
                    border: '1px solid rgba(0,208,132,0.3)',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar
                  dataKey="yield"
                  fill="#00d084"
                  isAnimationActive={true}
                  animationDuration={800}
                />
                <Bar
                  dataKey="temp"
                  fill="#7b2cbf"
                  isAnimationActive={true}
                  animationDuration={800}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </motion.div>
      </motion.div>
    </HoverScale>
  );
}
