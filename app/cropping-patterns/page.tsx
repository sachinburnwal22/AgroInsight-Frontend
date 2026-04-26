"use client";

import { useState } from "react";
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

export default function CroppingPatternsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedRegion, setExpandedRegion] = useState<string | null>(
    "north-india",
  );
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const croppingData = {
    "north-india": {
      region: "North India (Punjab, Haryana, Western UP)",
      rainfall: "400-900 mm",
      season: "Rabi Season (Oct-March)",
      primaryCrops: [
        {
          name: "Wheat",
          whyGrown:
            "Staple food crop with high demand; minimum support price ensures stable income",
          rainfall:
            "Requires 300-500 mm; suited to region's winter precipitation",
          soil: "Alluvial & loamy soils are ideal for wheat cultivation",
          marketDemand:
            "High domestic demand + export potential; food security focus",
          govPolicy:
            "MSP (Minimum Support Price) guaranteed by Government of India",
        },
        {
          name: "Rice",
          whyGrown:
            "Primary staple food; water availability supports cultivation",
          rainfall: "1000-2250 mm required; supplemented by canal irrigation",
          soil: "Loamy & clayey soils; good water retention capacity",
          marketDemand: "Essential commodity with consistent domestic demand",
          govPolicy:
            "Assured procurement by government through FCI (Food Corporation of India)",
        },
        {
          name: "Cotton",
          whyGrown: "Cash crop providing higher income than cereals",
          rainfall: "Requires 600-1000 mm; well-distributed rainfall essential",
          soil: "Black & loamy soils; moderate fertility requirements",
          marketDemand:
            "Strong textile industry demand + international markets",
          govPolicy:
            "Guaranteed price through government monopoly procurement scheme",
        },
      ],
    },
    "central-india": {
      region: "Central India (Madhya Pradesh, Chhattisgarh)",
      rainfall: "900-1400 mm",
      season: "Kharif Season (June-October)",
      primaryCrops: [
        {
          name: "Soybean",
          whyGrown:
            "Emerging cash crop with high protein content and export potential",
          rainfall: "700-1000 mm; ideal for monsoon rains of region",
          soil: "Well-drained black soils; nitrogen-fixing properties benefit soil health",
          marketDemand: "Growing domestic demand + significant export markets",
          govPolicy:
            "Included in ISOPOM (Integrated Scheme of Oilseeds, Pulses, Maize)",
        },
        {
          name: "Pulses (Chickpea, Lentil)",
          whyGrown:
            "Protein source for population; enriches soil with nitrogen",
          rainfall:
            "Rainfed cultivation possible; drought tolerant varieties available",
          soil: "Black soils ideal; low fertility soils suitable for pulse cultivation",
          marketDemand:
            "Essential protein source; vegetarian population demand",
          govPolicy:
            "MSP support; part of NFSM (National Food Security Mission)",
        },
        {
          name: "Sugarcane",
          whyGrown:
            "High-value cash crop; industrial demand for sugar production",
          rainfall: "1500-2250 mm required; significant water inputs needed",
          soil: "Deep loamy & clayey soils with good water-holding capacity",
          marketDemand: "Sugar industry + ethanol production emerging use",
          govPolicy:
            "Assured prices by sugar mills; cooperative support systems",
        },
      ],
    },
    "south-india": {
      region: "South India (Tamil Nadu, Karnataka, Telangana)",
      rainfall: "600-1600 mm",
      season: "Rabi & Kharif (Year-round cultivation)",
      primaryCrops: [
        {
          name: "Groundnut",
          whyGrown:
            "Oil-rich crop; drought tolerant; excellent for region's climate",
          rainfall: "400-600 mm; one of most drought-tolerant crops",
          soil: "Light & sandy loams; good drainage prevents waterlogging",
          marketDemand:
            "Oil extraction + food industry; international export market",
          govPolicy: "ISOPOM scheme support for oilseed promotion",
        },
        {
          name: "Coffee",
          whyGrown: "Premium plantation crop; high value per hectare",
          rainfall: "1500-2500 mm; altitude-dependent cultivation (1000-2000m)",
          soil: "Well-drained latosols & volcanic soils; rich organic matter",
          marketDemand:
            "International market; premium pricing for specialty varieties",
          govPolicy:
            "Export promotion through Agricultural & Processed Food Products Export Development Authority",
        },
        {
          name: "Spices (Turmeric, Pepper)",
          whyGrown: "High-value horticulture; global demand for Indian spices",
          rainfall:
            "Varies by spice; generally 1500-2250 mm for optimal growth",
          soil: "Well-drained loamy & laterite soils",
          marketDemand:
            "Global demand; India world's largest producer & exporter",
          govPolicy:
            "MIDH (Mission for Integrated Development of Horticulture) support",
        },
      ],
    },
    "east-india": {
      region: "East India (West Bengal, Assam, Odisha)",
      rainfall: "1600-2300 mm",
      season: "Kharif Dominant",
      primaryCrops: [
        {
          name: "Rice",
          whyGrown: "Region's primary staple; abundant water availability",
          rainfall: "1400-2300 mm; monsoon supports rice cultivation",
          soil: "Alluvial & clayey soils with high water retention",
          marketDemand:
            "Staple food; region's dietary essential; export potential",
          govPolicy:
            "BGREI (Bringing Green Revolution to Eastern India) program support",
        },
        {
          name: "Jute",
          whyGrown:
            "Traditional crop; ecological importance; natural fiber demand",
          rainfall: "1400-2250 mm; humidity essential for fiber quality",
          soil: "Loamy & clayey alluvial soils; prone to flooding tolerated",
          marketDemand:
            "Eco-friendly alternative to synthetic fibers; burlap bags demand",
          govPolicy: "Ministry support for sustainable natural fiber promotion",
        },
        {
          name: "Tea",
          whyGrown: "Premium plantation crop; climate perfectly suited",
          rainfall: "1500-2250 mm; distributed rainfall essential",
          soil: "Well-drained laterite soils; acidic soils ideal",
          marketDemand:
            "Global beverage market; India world's largest tea producer",
          govPolicy: "Tea Board support; export promotion initiatives",
        },
      ],
    },
  };

  const regionKeys = Object.keys(croppingData) as Array<
    keyof typeof croppingData
  >;

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

      {/* Sidebar Menu with Overlay */}
      {sidebarOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            onClick={() => setSidebarOpen(false)}
          />

          <motion.div
            className="fixed left-0 top-0 bottom-0 z-40 w-72 bg-card border-r border-border shadow-2xl"
            initial={{ x: -288 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="h-20 flex items-center justify-between px-6 border-b border-border">
              <h3 className="text-lg font-bold text-primary">Menu</h3>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="p-4 space-y-2">
              {[
                { label: "Dashboard", icon: BarChart3, href: "/" },
                {
                  label: "Cropping Patterns",
                  icon: Sprout,
                  href: "/cropping-patterns",
                },
                {
                  label: "Crop Recommendation",
                  icon: Leaf,
                  href: "/crop-recommendation",
                },
                { label: "Resources", icon: Book, href: "/resources" },
                { label: "Community", icon: Users, href: "/community" },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.3 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className="block w-full"
                    >
                      <div className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-muted/50 hover:bg-muted text-foreground transition-all duration-300 group cursor-pointer hover:scale-105 active:scale-95">
                        <Icon className="w-5 h-5 text-primary group-hover:text-accent transition-colors" />
                        <span className="font-medium flex-1">{item.label}</span>
                        <ChevronDown className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-card">
              <motion.div
                className="bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/40 rounded-lg p-4"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <p className="text-sm text-foreground font-semibold mb-2">
                  Pro Tip
                </p>
                <p className="text-xs text-muted-foreground">
                  Check out different regions to discover optimal crop
                  cultivation practices
                </p>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-transparent backdrop-blur-md bg-gradient-to-b from-background/40 to-transparent border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              whileHover={{
                scale: 1.1,
                backgroundColor: "rgba(var(--primary), 0.15)",
              }}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 relative cursor-pointer flex items-center justify-center group"
              type="button"
            >
              <Menu className="w-5 h-5 text-primary group-hover:text-accent transition-colors" />
            </motion.button>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              <Link href="/">
                <motion.h1
                  className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                >
                  AgroInsight
                </motion.h1>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            className="flex items-center gap-3 md:gap-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="hidden md:flex items-center gap-2 bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-xl px-4 py-2 backdrop-blur-sm hover:border-primary/40 transition-all duration-300 group"
              whileHover={{ scale: 1.02 }}
            >
              <Search className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search crops..."
                className="bg-transparent text-sm placeholder-muted-foreground outline-none w-40 group-hover:placeholder-primary/60 transition-colors"
              />
            </motion.div>
          </motion.div>
        </div>
      </header>

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
            {regionKeys.map((regionKey, idx) => {
              const region = croppingData[regionKey];
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
                              {region.region}
                            </h2>
                            <div className="flex gap-6 text-sm text-muted-foreground flex-wrap">
                              <span className="flex items-center gap-1">
                                <Cloud className="w-4 h-4 text-accent" />
                                Rainfall: {region.rainfall}
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
                          {region.primaryCrops.map((crop, cropIdx) => (
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
                                  🌾
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
                                      {crop.whyGrown}
                                    </p>
                                  </div>

                                  <div className="bg-gradient-to-r from-accent/10 to-transparent p-3 rounded-lg">
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-1 flex items-center gap-2">
                                      <Droplet className="w-3 h-3" /> Rainfall
                                      Requirements
                                    </p>
                                    <p className="text-foreground text-sm">
                                      {crop.rainfall}
                                    </p>
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <div className="bg-gradient-to-r from-secondary/10 to-transparent p-3 rounded-lg">
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-1">
                                      Soil Type
                                    </p>
                                    <p className="text-foreground text-sm">
                                      {crop.soil}
                                    </p>
                                  </div>

                                  <div className="bg-gradient-to-r from-destructive/10 to-transparent p-3 rounded-lg">
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-1">
                                      Market Demand
                                    </p>
                                    <p className="text-foreground text-sm">
                                      {crop.marketDemand}
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
                                  {crop.govPolicy}
                                </p>
                              </motion.div>
                            </motion.div>
                          ))}
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
