'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Sprout, TrendingUp, AlertCircle, CheckCircle2, Cloud, Droplet, Soil, DollarSign } from 'lucide-react';

interface CropRecommendation {
  name: string;
  suitability: number;
  rainfall: number;
  soilTypes: string[];
  season: string;
  expectedYield: string;
  marketDemand: string;
  governmentSupport: string;
  reason: string;
  emoji: string;
}

export default function CropRecommendationPage() {
  const [step, setStep] = useState(1);
  const [recommendations, setRecommendations] = useState<CropRecommendation[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    rainfall: '',
    soilType: '',
    landSize: '',
    region: '',
    marketAccess: '',
    budget: '',
    season: '',
  });

  const cropDatabase = {
    'high-rainfall-clay-any': [
      {
        name: 'Rice',
        suitability: 95,
        rainfall: 150,
        soilTypes: ['Clay', 'Loamy Clay'],
        season: 'Monsoon (Jun-Oct)',
        expectedYield: '50-60 quintals/hectare',
        marketDemand: 'Very High - Essential commodity',
        governmentSupport: 'MSP: ₹2100/quintal, PM-KISAN scheme available',
        reason: 'Thrives in high rainfall and clay soil. Heavy water requirements perfectly match your climate.',
        emoji: '🍚'
      },
      {
        name: 'Jute',
        suitability: 85,
        rainfall: 120,
        soilTypes: ['Clay', 'Loamy'],
        season: 'Mar-Jul',
        expectedYield: '25-30 quintals/hectare',
        marketDemand: 'High - Industrial demand',
        governmentSupport: 'Special subsidy in Eastern India, MSP support',
        reason: 'Excellent for clay soils with high rainfall. Good export potential.',
        emoji: '🌾'
      },
      {
        name: 'Tea',
        suitability: 80,
        rainfall: 180,
        soilTypes: ['Clay-Loam', 'Acidic'],
        season: 'Year-round',
        expectedYield: '2000-2500 kg/hectare',
        marketDemand: 'High - Global demand',
        governmentSupport: 'Tea Board support, Export subsidies',
        reason: 'Requires exactly your climate conditions. Long-term profitable crop.',
        emoji: '🍵'
      }
    ],
    'high-rainfall-loam-any': [
      {
        name: 'Sugarcane',
        suitability: 90,
        rainfall: 100,
        soilTypes: ['Loamy', 'Clay-Loam'],
        season: 'Dec-May',
        expectedYield: '80-100 quintals/hectare',
        marketDemand: 'Very High - Industrial demand',
        governmentSupport: 'MSP: ₹2900/quintal, Crop insurance available',
        reason: 'Loamy soil is ideal for sugarcane. High rainfall supports growth.',
        emoji: '🍬'
      },
      {
        name: 'Coconut',
        suitability: 85,
        rainfall: 150,
        soilTypes: ['Loamy', 'Sandy-Loam'],
        season: 'Year-round',
        expectedYield: '60-80 nuts/tree/year',
        marketDemand: 'Very High - Multiple uses',
        governmentSupport: 'Coconut Development Board schemes',
        reason: 'Perfect rainfall and soil conditions. Reliable income source.',
        emoji: '🥥'
      }
    ],
    'medium-rainfall-sandy-any': [
      {
        name: 'Groundnut',
        suitability: 90,
        rainfall: 50,
        soilTypes: ['Sandy', 'Sandy-Loam'],
        season: 'Jun-Oct',
        expectedYield: '20-25 quintals/hectare',
        marketDemand: 'Very High - Oil & food industry',
        governmentSupport: 'MSP: ₹5900/quintal, Crop insurance',
        reason: 'Sandy soil is perfect for groundnut cultivation. Drought tolerant.',
        emoji: '🥜'
      },
      {
        name: 'Jowar',
        suitability: 88,
        rainfall: 40,
        soilTypes: ['Sandy', 'Loamy'],
        season: 'Jun-Oct',
        expectedYield: '20-30 quintals/hectare',
        marketDemand: 'Medium - Animal feed & food',
        governmentSupport: 'MSP support, Drought resilient crop',
        reason: 'Extremely drought tolerant. Sandy soil ideal. Low water needs.',
        emoji: '🌾'
      },
      {
        name: 'Bajra',
        suitability: 85,
        rainfall: 35,
        soilTypes: ['Sandy', 'Sandy-Loam'],
        season: 'May-Oct',
        expectedYield: '15-20 quintals/hectare',
        marketDemand: 'Medium-High - Health food trend',
        governmentSupport: 'MSP: ₹2350/quintal',
        reason: 'Highly drought resistant. Perfect for arid sandy soils.',
        emoji: '🌾'
      }
    ],
    'low-rainfall-sandy-any': [
      {
        name: 'Mustard',
        suitability: 92,
        rainfall: 35,
        soilTypes: ['Sandy', 'Well-drained'],
        season: 'Oct-Mar',
        expectedYield: '15-20 quintals/hectare',
        marketDemand: 'Very High - Oil industry',
        governmentSupport: 'MSP: ₹5900/quintal',
        reason: 'Perfectly suited for low rainfall. Winter crop for sandy soils.',
        emoji: '🌱'
      },
      {
        name: 'Gram (Chickpea)',
        suitability: 88,
        rainfall: 40,
        soilTypes: ['Sandy', 'Well-drained'],
        season: 'Oct-Mar',
        expectedYield: '18-22 quintals/hectare',
        marketDemand: 'Very High - Protein source',
        governmentSupport: 'MSP: ₹5500/quintal, Pulses subsidy',
        reason: 'Drought tolerant. Enriches soil with nitrogen. Good profitability.',
        emoji: '🫘'
      }
    ],
    'medium-rainfall-loam-small': [
      {
        name: 'Vegetables (Mixed)',
        suitability: 90,
        rainfall: 60,
        soilTypes: ['Loamy', 'Rich organic'],
        season: 'Year-round',
        expectedYield: '200-300 quintals/hectare',
        marketDemand: 'Very High - Daily demand',
        governmentSupport: 'Horticulture Mission, Per drop more crop',
        reason: 'Perfect for small holdings. High income potential. Year-round production.',
        emoji: '🥕'
      },
      {
        name: 'Spices (Turmeric/Chili)',
        suitability: 85,
        rainfall: 70,
        soilTypes: ['Loamy', 'Well-drained'],
        season: 'Jun-Mar',
        expectedYield: '25-30 quintals/hectare',
        marketDemand: 'Very High - Export demand',
        governmentSupport: 'Spice Board schemes, Export subsidies',
        reason: 'Small plots ideal for spice farming. High value crops. Premium prices.',
        emoji: '🌶️'
      }
    ],
  };

  const getSoilLabel = (soilType: string) => {
    const soilMap: { [key: string]: string } = {
      'clay': 'Clay',
      'loam': 'Loamy',
      'sandy': 'Sandy',
      'sandy-loam': 'Sandy-Loam',
      'clay-loam': 'Clay-Loam',
    };
    return soilMap[soilType] || soilType;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const generateRecommendations = () => {
    setLoading(true);
    
    // Determine rainfall category
    const rainfallNum = parseInt(formData.rainfall) || 0;
    let rainfallCategory = '';
    if (rainfallNum >= 150) rainfallCategory = 'high-rainfall';
    else if (rainfallNum >= 60) rainfallCategory = 'medium-rainfall';
    else rainfallCategory = 'low-rainfall';

    // Build key for crop database
    const soilCategory = formData.soilType;
    const sizeCategory = parseInt(formData.landSize) <= 2 ? 'small' : 'any';
    const key = `${rainfallCategory}-${soilCategory}-${sizeCategory}`;

    const alternativeKey = `${rainfallCategory}-${soilCategory}-any`;
    
    setTimeout(() => {
      const crops = (cropDatabase as any)[key] || (cropDatabase as any)[alternativeKey] || [];
      
      const sortedCrops = crops.sort((a: CropRecommendation, b: CropRecommendation) => 
        b.suitability - a.suitability
      );

      setRecommendations(sortedCrops);
      setLoading(false);
      setStep(2);
    }, 1500);
  };

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
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-[#0f0f2e]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-card/80 border-b border-border backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 text-primary hover:text-accent transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Back</span>
            </motion.button>
          </Link>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Crop Recommendation Engine
          </h1>
          <div className="w-24" />
        </div>
      </header>

      <main className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {step === 1 ? (
            // Input Form
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="bg-card/60 border border-border rounded-2xl p-8 backdrop-blur-xl"
            >
              <motion.div variants={itemVariants} className="mb-8">
                <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
                  <Sprout className="w-8 h-8 text-primary" />
                  Find Your Perfect Crop
                </h2>
                <p className="text-muted-foreground">Answer a few questions about your farm conditions to get personalized crop recommendations</p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Rainfall */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-semibold mb-3 flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-accent" />
                    Annual Rainfall (mm)
                  </label>
                  <input
                    type="number"
                    name="rainfall"
                    placeholder="e.g., 800"
                    value={formData.rainfall}
                    onChange={handleInputChange}
                    className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                  <p className="text-xs text-muted-foreground mt-2">Low: &lt;50mm | Medium: 50-150mm | High: &gt;150mm</p>
                </motion.div>

                {/* Soil Type */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-semibold mb-3 flex items-center gap-2">
                    <Soil className="w-4 h-4 text-primary" />
                    Soil Type
                  </label>
                  <select
                    name="soilType"
                    value={formData.soilType}
                    onChange={handleInputChange}
                    className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="">Select soil type</option>
                    <option value="clay">Clay</option>
                    <option value="loam">Loamy</option>
                    <option value="sandy">Sandy</option>
                    <option value="sandy-loam">Sandy-Loam</option>
                    <option value="clay-loam">Clay-Loam</option>
                  </select>
                </motion.div>

                {/* Land Size */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-semibold mb-3">Land Size (hectares)</label>
                  <input
                    type="number"
                    name="landSize"
                    placeholder="e.g., 2"
                    value={formData.landSize}
                    onChange={handleInputChange}
                    className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                </motion.div>

                {/* Region */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-semibold mb-3">Region</label>
                  <select
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="">Select region</option>
                    <option value="north">North India</option>
                    <option value="south">South India</option>
                    <option value="east">East India</option>
                    <option value="west">West India</option>
                    <option value="central">Central India</option>
                  </select>
                </motion.div>

                {/* Market Access */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-semibold mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-accent" />
                    Market Access
                  </label>
                  <select
                    name="marketAccess"
                    value={formData.marketAccess}
                    onChange={handleInputChange}
                    className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="">Select market access</option>
                    <option value="local">Local market only</option>
                    <option value="regional">Regional market</option>
                    <option value="national">National market</option>
                    <option value="export">Export potential</option>
                  </select>
                </motion.div>

                {/* Budget */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-semibold mb-3">Investment Budget (₹)</label>
                  <select
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="">Select budget range</option>
                    <option value="low">Low (&lt;₹50,000)</option>
                    <option value="medium">Medium (₹50-200k)</option>
                    <option value="high">High (&gt;₹200k)</option>
                  </select>
                </motion.div>
              </div>

              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={generateRecommendations}
                disabled={!formData.rainfall || !formData.soilType}
                className="w-full px-8 py-4 rounded-lg bg-gradient-to-r from-primary to-accent text-background font-bold text-lg shadow-lg shadow-primary/50 hover:shadow-primary/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Get Crop Recommendations
              </motion.button>
            </motion.div>
          ) : (
            // Results
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants} className="mb-8">
                <h2 className="text-3xl font-bold mb-2">Recommended Crops for Your Farm</h2>
                <p className="text-muted-foreground">Based on rainfall: {formData.rainfall}mm, Soil: {getSoilLabel(formData.soilType)}, Land: {formData.landSize}ha</p>
              </motion.div>

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary"
                  />
                </div>
              ) : (
                <div className="space-y-6">
                  {recommendations.map((crop, idx) => (
                    <motion.div
                      key={crop.name}
                      variants={itemVariants}
                      whileHover={{ y: -5 }}
                      className="bg-card/60 border border-border rounded-2xl overflow-hidden backdrop-blur-xl group hover:border-primary/40 transition-colors"
                    >
                      <div className="bg-gradient-to-r from-primary/10 to-accent/10 px-8 py-6 border-b border-border">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-4">
                            <motion.div
                              className="text-5xl"
                              animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
                              transition={{ duration: 2, repeat: Infinity, delay: idx * 0.1 }}
                            >
                              {crop.emoji}
                            </motion.div>
                            <div>
                              <h3 className="text-2xl font-bold">{crop.name}</h3>
                              <p className="text-muted-foreground">Rank #{idx + 1}</p>
                            </div>
                          </div>
                          <motion.div
                            className="text-right"
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity, delay: idx * 0.1 }}
                          >
                            <div className="text-3xl font-bold text-primary">{crop.suitability}%</div>
                            <p className="text-xs text-muted-foreground">Suitability</p>
                          </motion.div>
                        </div>
                      </div>

                      <div className="px-8 py-6 space-y-4">
                        <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                          <p className="text-sm leading-relaxed"><strong>Why this crop?</strong> {crop.reason}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <motion.div whileHover={{ scale: 1.05 }} className="bg-muted/30 rounded-lg p-4 border border-border/50">
                            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-2">
                              <Droplet className="w-4 h-4 text-accent" />
                              Required Rainfall
                            </p>
                            <p className="font-semibold">{crop.rainfall}mm+</p>
                          </motion.div>

                          <motion.div whileHover={{ scale: 1.05 }} className="bg-muted/30 rounded-lg p-4 border border-border/50">
                            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-2">
                              <Soil className="w-4 h-4 text-primary" />
                              Ideal Soil Types
                            </p>
                            <p className="font-semibold">{crop.soilTypes.join(', ')}</p>
                          </motion.div>

                          <motion.div whileHover={{ scale: 1.05 }} className="bg-muted/30 rounded-lg p-4 border border-border/50">
                            <p className="text-xs text-muted-foreground mb-1">Harvest Season</p>
                            <p className="font-semibold text-sm">{crop.season}</p>
                          </motion.div>

                          <motion.div whileHover={{ scale: 1.05 }} className="bg-muted/30 rounded-lg p-4 border border-border/50">
                            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-accent" />
                              Expected Yield
                            </p>
                            <p className="font-semibold text-sm">{crop.expectedYield}</p>
                          </motion.div>

                          <motion.div whileHover={{ scale: 1.05 }} className="md:col-span-2 bg-muted/30 rounded-lg p-4 border border-border/50">
                            <p className="text-xs text-muted-foreground mb-1">Market Demand</p>
                            <p className="font-semibold text-sm">{crop.marketDemand}</p>
                          </motion.div>

                          <motion.div whileHover={{ scale: 1.05 }} className="md:col-span-2 bg-primary/10 rounded-lg p-4 border border-primary/40">
                            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-primary" />
                              Government Support
                            </p>
                            <p className="font-semibold text-sm">{crop.governmentSupport}</p>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setStep(1);
                  setFormData({
                    rainfall: '',
                    soilType: '',
                    landSize: '',
                    region: '',
                    marketAccess: '',
                    budget: '',
                    season: '',
                  });
                }}
                className="mt-8 w-full px-8 py-4 rounded-lg border-2 border-primary text-primary font-bold text-lg hover:bg-primary/10 transition-all duration-300"
              >
                Try Different Conditions
              </motion.button>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
