"use client";

import { motion } from "framer-motion";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { ChartSection } from "@/components/dashboard/chart-section";
import { StatCard } from "@/components/dashboard/stat-card";
import { useEffect, useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Droplet, Layers, Leaf } from "lucide-react";

const defaultCropDistribution = [
  { name: "Wheat", value: 35 },
  { name: "Corn", value: 28 },
  { name: "Rice", value: 22 },
  { name: "Soybeans", value: 15 },
];

const COLORS = [
  "#00d084",
  "#00b4d8",
  "#7b2cbf",
  "#ff9f43",
  "#ff6b6b",
  "#ffd166",
];

interface SummaryData {
  total_regions: number;
  average_land_size: number;
  average_irrigation_coverage: number;
  most_common_crop: {
    name: string | null;
    total_area_percentage: number;
  };
}

interface RegionComparison {
  region: string;
  soil_type: string;
  climate: string;
  avg_land_size: number;
  average_irrigation_coverage: number;
  main_crop: string | null;
  total_crop_area: number;
}

interface IrrigationSummary {
  type: string;
  count: number;
  average_coverage: number;
}

interface AnalyticsData {
  summary: SummaryData;
  crop_distribution: Array<{ name: string; value: number }>;
  region_comparison: RegionComparison[];
  irrigation_summary: IrrigationSummary[];
}

export default function AnalyticsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiBase =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await fetch(`${apiBase}/analytics`);
        if (!response.ok) {
          throw new Error(`Failed to load analytics (${response.status})`);
        }

        const json = await response.json();
        setAnalytics(json.data);
      } catch (err) {
        console.error(err);
        setError("Unable to load analytics data.");
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [apiBase]);

  const summary = analytics?.summary ?? {
    total_regions: 0,
    average_land_size: 0,
    average_irrigation_coverage: 0,
    most_common_crop: { name: null, total_area_percentage: 0 },
  };

  const cropDistribution =
    analytics?.crop_distribution ?? defaultCropDistribution;
  const regionComparison = analytics?.region_comparison ?? [];
  const irrigationSummary = analytics?.irrigation_summary ?? [];

  const performanceMetrics = useMemo(
    () => [
      {
        label: "Water Efficiency",
        value: Math.round(summary.average_irrigation_coverage),
        color: "from-accent to-primary",
      },
      {
        label: "Average Land Size",
        value: Math.round(summary.average_land_size),
        color: "from-primary to-secondary",
      },
      {
        label: "Region Count",
        value: summary.total_regions,
        color: "from-secondary to-accent",
      },
      {
        label: "Top Crop Share",
        value: Math.round(summary.most_common_crop.total_area_percentage),
        color: "from-primary to-accent",
      },
    ],
    [summary],
  );

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
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Analytics
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Real farm performance, live from the backend. Explore crop mix,
              irrigation, and region-level insight in a single dashboard.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Total Regions"
              value={loading ? "…" : summary.total_regions}
              icon={Layers}
              color="primary"
              trend={{ value: 6, isPositive: true }}
              delay={0}
            />
            <StatCard
              title="Average Land Size"
              value={loading ? "…" : summary.average_land_size}
              unit="ha"
              icon={Leaf}
              color="accent"
              trend={{ value: 4, isPositive: true }}
              delay={0.1}
            />
            <StatCard
              title="Irrigation Coverage"
              value={loading ? "…" : summary.average_irrigation_coverage}
              unit="%"
              icon={Droplet}
              color="secondary"
              trend={{ value: 9, isPositive: true }}
              delay={0.2}
            />
          </div>

          {error ? (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-destructive">
              <p className="font-semibold">Unable to load analytics.</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <ChartSection
                  title="Regional Land & Water"
                  type="bar"
                  data={regionComparison}
                  series={[
                    {
                      key: "avg_land_size",
                      name: "Avg Land Size",
                      fill: "#00d084",
                      stroke: "#00d084",
                    },
                    {
                      key: "average_irrigation_coverage",
                      name: "Irrigation Coverage",
                      fill: "#00b4d8",
                      stroke: "#00b4d8",
                    },
                  ]}
                  delay={0.3}
                />

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="bg-card border border-border rounded-xl p-6 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        Crop Distribution
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Area share by crop across all regions.
                      </p>
                    </div>
                  </div>
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
                          backgroundColor: "#1a1a2e",
                          border: "1px solid rgba(0,208,132,0.3)",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="bg-card border border-border rounded-xl p-6 backdrop-blur-sm"
              >
                <h3 className="text-lg font-semibold text-foreground mb-6">
                  Market Pulse
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {performanceMetrics.map((metric, index) => (
                    <motion.div
                      key={metric.label}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.55 + index * 0.08 }}
                      className="rounded-2xl border border-border p-4 bg-background/80"
                    >
                      <div className="flex items-center justify-between gap-4 mb-4">
                        <span className="text-sm text-muted-foreground font-medium">
                          {metric.label}
                        </span>
                        <span
                          className={`text-lg font-semibold bg-clip-text text-transparent bg-linear-to-r ${metric.color}`}
                        >
                          {metric.value}%
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full bg-linear-to-r ${metric.color}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${metric.value}%` }}
                          transition={{
                            duration: 0.8,
                            delay: 0.6 + index * 0.08,
                          }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.55 }}
                className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8"
              >
                <div className="xl:col-span-2 bg-card border border-border rounded-xl p-6 backdrop-blur-sm">
                  <h3 className="text-lg font-semibold text-foreground mb-6">
                    Regional Crop Flow
                  </h3>
                  <div className="space-y-4">
                    {regionComparison.map((region, index) => (
                      <div
                        key={region.region}
                        className="rounded-2xl border border-border p-4 bg-background/80"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                          <div>
                            <h4 className="text-base font-semibold text-foreground">
                              {region.region}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {region.soil_type} · {region.climate}
                            </p>
                          </div>
                          <span className="text-sm font-medium text-primary">
                            {region.main_crop || "Mixed"}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Land Size</span>
                            <span>{region.avg_land_size} ha</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                            <motion.div
                              className="h-full bg-linear-to-r from-primary to-accent"
                              initial={{ width: 0 }}
                              animate={{
                                width: `${Math.min(region.avg_land_size, 100)}%`,
                              }}
                              transition={{
                                duration: 0.8,
                                delay: 0.7 + index * 0.05,
                              }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Irrigation</span>
                            <span>{region.average_irrigation_coverage}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                            <motion.div
                              className="h-full bg-linear-to-r from-accent to-secondary"
                              initial={{ width: 0 }}
                              animate={{
                                width: `${region.average_irrigation_coverage}%`,
                              }}
                              transition={{
                                duration: 0.8,
                                delay: 0.75 + index * 0.05,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 backdrop-blur-sm">
                  <h3 className="text-lg font-semibold text-foreground mb-6">
                    Irrigation Breakdown
                  </h3>
                  <div className="space-y-3">
                    {irrigationSummary.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No irrigation categories available yet.
                      </p>
                    ) : (
                      irrigationSummary.map((item) => (
                        <div
                          key={item.type}
                          className="rounded-2xl border border-border p-4 bg-background/80"
                        >
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <span className="text-sm font-medium text-foreground">
                              {item.type}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {item.count} records
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Avg coverage</span>
                            <span>{item.average_coverage}%</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}
