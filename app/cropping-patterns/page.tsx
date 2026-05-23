"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ChevronDown,
  Droplet,
  Cloud,
  TrendingUp,
  MapPin,
  Leaf,
  Award,
  AlertCircle,
  Menu,
  X,
  BarChart3,
  Book,
  Sprout,
  Users,
  Search,
} from "lucide-react";
import Link from "next/link";
import FloatingNavbar from "@/components/ui/FloatingNavbar";

export default function CroppingPatternsPage() {
  const [expandedRegion, setExpandedRegion] = useState<string | null>(
    "north-india",
  );
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const [regionsData, setRegionsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/regions")
      .then((res) => res.json())
      .then((data) => {
        setRegionsData(data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch regions", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-[#0f0f2e] text-foreground overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, -30, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-32 left-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl"
          animate={{ x: [0, -40, 0], y: [0, 40, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <FloatingNavbar />

      {/* Main Content */}
      <main className="pt-24 pb-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Title */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Cropping Patterns Guide
            </motion.h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              Discover optimal crop cultivation based on regional rainfall, soil
              type, market demand, and government policies. Data-driven insights
              for agricultural success.
            </p>
          </motion.div>

          {/* Filter Tabs */}
          <motion.div
            className="mb-8 flex gap-3 flex-wrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {["all", "rainfall", "soil", "market", "policy"].map((filter) => (
              <motion.button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  selectedFilter === filter
                    ? "bg-gradient-to-r from-primary to-accent text-background"
                    : "bg-muted/50 text-foreground border border-border hover:border-primary"
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </motion.button>
            ))}
          </motion.div>

          {/* Regional Cropping Patterns */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {loading ? (
              <div className="flex justify-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full"
                />
              </div>
            ) : regionsData.map((region, idx) => {
              const regionKey = region.key;
              const isExpanded = expandedRegion === regionKey;

              return (
                <motion.div key={regionKey} variants={itemVariants}>
                  <motion.div
                    onClick={() =>
                      setExpandedRegion(isExpanded ? null : regionKey)
                    }
                    className="bg-card/60 border border-border rounded-2xl p-6 backdrop-blur-xl cursor-pointer group overflow-hidden relative"
                    whileHover={{ scale: 1.02 }}
                  >
                    {/* Background Gradient */}
                    <motion.div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-br from-primary/20 to-accent/20 transition-opacity duration-500" />

                    <div className="relative z-10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                            className="p-3 rounded-lg bg-primary/20 border border-primary/40"
                          >
                            <MapPin className="w-6 h-6 text-primary" />
                          </motion.div>
                          <div>
                            <h2 className="text-2xl font-bold mb-1">
                              {region.name}
                            </h2>
                            <div className="flex gap-6 text-sm text-muted-foreground flex-wrap">
                              <span className="flex items-center gap-1">
                                <Cloud className="w-4 h-4 text-accent" />
                                Rainfall: {region.rainfall_range}
                              </span>
                              <span className="flex items-center gap-1">
                                <Leaf className="w-4 h-4 text-primary" />
                                Season: {region.season}
                              </span>
                            </div>
                          </div>
                        </div>
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ChevronDown className="w-6 h-6 text-accent" />
                        </motion.div>
                      </div>

                      {/* Expanded Content */}
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{
                          opacity: isExpanded ? 1 : 0,
                          height: isExpanded ? "auto" : 0,
                        }}
                        transition={{ duration: 0.4 }}
                        className="mt-6 overflow-hidden"
                      >
                        <div className="space-y-4 pt-6 border-t border-border/50">
                          {region.cropping_patterns?.map((pattern: any, cropIdx: number) => {
                            const crop = pattern.crop;
                            if (!crop) return null;
                            return (
                            <motion.div
                              key={crop.name}
                              initial={{ opacity: 0, y: 10 }}
                              animate={
                                isExpanded
                                  ? { opacity: 1, y: 0 }
                                  : { opacity: 0, y: 10 }
                              }
                              transition={{ delay: cropIdx * 0.1 }}
                              className="bg-muted/40 rounded-xl p-5 border border-border/50 hover:border-primary/40 transition-all duration-300 group/crop"
                            >
                              <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                                <motion.span
                                  animate={{ rotate: [0, 360] }}
                                  transition={{ duration: 4, repeat: Infinity }}
                                >
                                  {crop.emoji || '🌾'}
                                </motion.span>
                                {crop.name}
                              </h3>

                              <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                  <div className="bg-gradient-to-r from-primary/10 to-transparent p-3 rounded-lg">
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-1">
                                      Why Grown Here
                                    </p>
                                    <p className="text-foreground text-sm">
                                      {crop.why_grown}
                                    </p>
                                  </div>

                                  <div className="bg-gradient-to-r from-accent/10 to-transparent p-3 rounded-lg">
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-1 flex items-center gap-2">
                                      <Droplet className="w-3 h-3" /> Rainfall
                                      Requirements
                                    </p>
                                    <p className="text-foreground text-sm">
                                      {crop.water_requirement} mm
                                    </p>
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <div className="bg-gradient-to-r from-secondary/10 to-transparent p-3 rounded-lg">
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-1">
                                      Soil Type
                                    </p>
                                    <p className="text-foreground text-sm">
                                      {crop.ideal_soil}
                                    </p>
                                  </div>

                                  <div className="bg-gradient-to-r from-destructive/10 to-transparent p-3 rounded-lg">
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-1">
                                      Market Demand
                                    </p>
                                    <p className="text-foreground text-sm">
                                      {crop.market_demand}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={
                                  isExpanded
                                    ? { opacity: 1, y: 0 }
                                    : { opacity: 0, y: 10 }
                                }
                                transition={{ delay: cropIdx * 0.1 + 0.2 }}
                                className="mt-4 bg-primary/5 border border-primary/20 rounded-lg p-3"
                              >
                                <p className="text-xs uppercase tracking-wide text-primary font-semibold mb-1 flex items-center gap-2">
                                  <Award className="w-3 h-3" /> Government
                                  Policy
                                </p>
                                <p className="text-foreground text-sm">
                                  {crop.government_support}
                                </p>
                              </motion.div>
                            </motion.div>
                          )})}
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Key Insights Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12"
          >
            <h2 className="text-3xl font-bold mb-6">Key Insights</h2>
            <motion.div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: "Cropping Intensity",
                  description:
                    "India's cropping intensity increased from 111% (1950) to 151% (2020), showing more efficient land utilization with multiple crops per year.",
                  icon: TrendingUp,
                },
                {
                  title: "Horticulture Growth",
                  description:
                    "Horticulture production exceeded foodgrain production in 2022-23, indicating shift towards high-value crops and health-conscious farming.",
                  icon: Award,
                },
                {
                  title: "Water-Intensive Crops",
                  description:
                    "Rice and sugarcane consume 60% of irrigation water. Sustainable practices and MSP policies guide crop selection for water management.",
                  icon: Droplet,
                },
                {
                  title: "Policy Support",
                  description:
                    "Government supports 23 crops through MSP, with strongest support for rice, wheat, and sugarcane ensuring farmer income stability.",
                  icon: AlertCircle,
                },
              ].map((insight, idx) => {
                const Icon = insight.icon;
                return (
                  <motion.div
                    key={insight.title}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + idx * 0.1 }}
                    whileHover={{ scale: 1.05, y: -10 }}
                    className="bg-card/60 border border-border rounded-xl p-6 backdrop-blur-xl group"
                  >
                    <motion.div className="p-3 rounded-lg bg-muted/50 w-fit mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                      <Icon className="w-6 h-6 text-primary" />
                    </motion.div>
                    <h3 className="text-lg font-bold mb-2">{insight.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {insight.description}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
