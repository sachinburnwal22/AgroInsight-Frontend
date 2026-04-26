'use client';

import { motion } from 'framer-motion';
import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import { ChartSection } from '@/components/dashboard/chart-section';
import { StatCard } from '@/components/dashboard/stat-card';
import { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

const cropDistribution = [
  { name: 'Wheat', value: 35 },
  { name: 'Corn', value: 28 },
  { name: 'Rice', value: 22 },
  { name: 'Soybeans', value: 15 },
];

const COLORS = ['#00d084', '#00b4d8', '#7b2cbf', '#ff9f43'];

export default function AnalyticsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="md:ml-0 pt-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Analytics
            </h1>
            <p className="text-muted-foreground">
              Comprehensive insights into your agricultural performance
            </p>
          </motion.div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Total Yield"
              value="2,485"
              unit="tons"
              icon={TrendingUp}
              color="primary"
              trend={{ value: 12, isPositive: true }}
              delay={0}
            />
            <StatCard
              title="Average Health"
              value="82"
              unit="%"
              icon={TrendingUp}
              color="accent"
              trend={{ value: 5, isPositive: true }}
              delay={0.1}
            />
            <StatCard
              title="Farmland Efficiency"
              value="88"
              unit="%"
              icon={TrendingUp}
              color="secondary"
              trend={{ value: 8, isPositive: true }}
              delay={0.2}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ChartSection
              title="Crop Yield Trends"
              type="line"
              delay={0.3}
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-card border border-border rounded-xl p-6 backdrop-blur-sm"
            >
              <h3 className="text-lg font-semibold text-foreground mb-6">
                Crop Distribution
              </h3>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={cropDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name} ${value}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    animationDuration={800}
                  >
                    {cropDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a2e',
                      border: '1px solid rgba(0,208,132,0.3)',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Performance Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-card border border-border rounded-xl p-6 backdrop-blur-sm"
          >
            <h3 className="text-lg font-semibold text-foreground mb-6">
              Performance Metrics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  label: 'Water Efficiency',
                  value: 87,
                  color: 'from-accent to-primary',
                },
                {
                  label: 'Fertilizer Usage',
                  value: 72,
                  color: 'from-primary to-secondary',
                },
                {
                  label: 'Pest Control',
                  value: 94,
                  color: 'from-secondary to-accent',
                },
                {
                  label: 'Crop Rotation',
                  value: 68,
                  color: 'from-primary to-accent',
                },
              ].map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-foreground font-medium">
                      {metric.label}
                    </span>
                    <span className={`bg-gradient-to-r ${metric.color} bg-clip-text text-transparent font-bold`}>
                      {metric.value}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${metric.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${metric.value}%` }}
                      transition={{ duration: 1, delay: 0.7 + index * 0.1 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
