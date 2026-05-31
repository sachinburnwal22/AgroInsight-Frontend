"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ShoppingCart, Info, Check, BrainCircuit } from "lucide-react";
import axios from "axios";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/lib/utils";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
}

interface Shop {
  id: number;
  name: string;
  category: string;
  description?: string;
}

interface ProductModalProps {
  shop: Shop | null;
  onClose: () => void;
}

export default function ProductModal({ shop, onClose }: ProductModalProps) {
  const { addToCart, isCheckingOut } = useCart();
  const { token, user } = useAuth();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
  
  // AI Recommendations state
  const [aiRecs, setAiRecs] = useState<string>("");
  const [loadingAI, setLoadingAI] = useState(false);

  // 1. Fetch products when shop changes
  useEffect(() => {
    if (!shop) return;

    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/shops/${shop.id}/products`);
        if (res.data.status === "success") {
          setProducts(res.data.data);
          // Initialize quantity state
          const initialQties: { [key: number]: number } = {};
          res.data.data.forEach((p: Product) => {
            initialQties[p.id] = 1;
          });
          setQuantities(initialQties);
        }
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [shop]);

  // 2. Fetch AI suggestions based on user context
  useEffect(() => {
    if (!shop || !token) return;

    const fetchAiRecommendations = async () => {
      setLoadingAI(true);
      setAiRecs("");
      try {
        const userCrop = user?.region ? "Wheat/Rice" : "General crops";
        const userRegion = user?.region || "Central India";

        const res = await axios.post(
          `${API_BASE_URL}/api/market/recommendations`,
          {
            crop: userCrop,
            region: userRegion
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.recommendations) {
          setAiRecs(res.data.recommendations);
        }
      } catch (err) {
        console.error("Failed to fetch AI marketplace recommendations:", err);
        setAiRecs("Failed to retrieve satellite recommendations. Verify Gemini API keys are active.");
      } finally {
        setLoadingAI(false);
      }
    };

    fetchAiRecommendations();
  }, [shop, token, user]);

  if (!shop) return null;

  const handleQtyChange = (productId: number, val: number) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(1, val)
    }));
  };

  const handleAddToCart = async (product: Product) => {
    const qty = quantities[product.id] || 1;
    await addToCart(product.id, qty);
  };

  return (
    <>
      {/* Background overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md"
      />

      {/* Pop-up panel wrapper */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-x-auto md:w-[850px] md:left-1/2 md:-translate-x-1/2 z-[130] bg-[#06060e]/95 border border-primary/25 rounded-[2.5rem] shadow-[0_0_80px_rgba(0,208,132,0.25)] p-6 md:p-8 backdrop-blur-3xl overflow-hidden max-h-[85vh] flex flex-col font-sans text-foreground"
      >
        {/* Dynamic Neon Corner Accents */}
        <div className="absolute top-0 left-0 w-24 h-[1px] bg-gradient-to-r from-primary to-transparent" />
        <div className="absolute top-0 left-0 w-[1px] h-24 bg-gradient-to-b from-primary to-transparent" />

        {/* Header Section */}
        <div className="flex justify-between items-start pb-4 border-b border-white/5 mb-6">
          <div className="text-left">
            <div className="flex items-baseline gap-2">
              <span className="text-xl">🏪</span>
              <h3 className="text-2xl font-black text-white">{shop.name}</h3>
            </div>
            <span className="text-[10px] font-mono tracking-widest text-primary uppercase leading-none mt-1.5 block">
              CATEGORY: {shop.category}
            </span>
            <p className="text-xs text-muted-foreground mt-2 max-w-xl leading-relaxed">
              {shop.description || ""}
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white cursor-pointer border border-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic content wrapper (Split grid on larger viewports) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-6 overflow-hidden min-h-0">
          
          {/* Left Area: Product List Grid (Takes 3/5 width) */}
          <div className="lg:col-span-3 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {loadingProducts ? (
              <div className="h-full flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest animate-pulse">Syncing Inventory...</span>
              </div>
            ) : products.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-20 text-muted-foreground font-mono text-xs">
                <span>[INVENTORY_EMPTY]</span>
              </div>
            ) : (
              products.map((product) => {
                const qty = quantities[product.id] || 1;
                return (
                  <div
                    key={product.id}
                    className="p-4 bg-white/5 border border-white/5 hover:border-primary/20 rounded-2xl flex gap-4 items-center transition-all duration-300 relative group overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    
                    {/* Image */}
                    <div
                      className="w-20 h-20 bg-cover bg-center rounded-xl border border-white/10 flex-shrink-0"
                      style={{ backgroundImage: `url(${product.image})` }}
                    />
                    
                    {/* Metadata */}
                    <div className="flex-1 text-left min-w-0">
                      <h4 className="font-bold text-sm text-white truncate">{product.name}</h4>
                      <p className="text-[10px] text-muted-foreground line-clamp-2 mt-1 leading-normal">{product.description}</p>
                      
                      <div className="flex justify-between items-baseline mt-2.5">
                        <span className="text-sm font-black text-primary">₹{product.price}</span>
                        <span className="text-[9px] font-mono text-muted-foreground">STOCK: {product.stock} units</span>
                      </div>
                    </div>

                    {/* Quantity & Cart trigger column */}
                    <div className="flex flex-col items-center gap-2 flex-shrink-0">
                      {/* Quantity Toggler */}
                      <div className="flex items-center bg-black/40 border border-white/10 rounded-lg p-1">
                        <button
                          onClick={() => handleQtyChange(product.id, qty - 1)}
                          className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-muted-foreground hover:text-white cursor-pointer select-none"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-mono font-bold text-white">{qty}</span>
                        <button
                          onClick={() => handleQtyChange(product.id, qty + 1)}
                          className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-muted-foreground hover:text-white cursor-pointer select-none"
                        >
                          +
                        </button>
                      </div>

                      {/* Add to Cart button */}
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="w-full py-2 px-3 bg-primary hover:bg-primary/95 text-black font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1 shadow-[0_0_10px_rgba(0,208,132,0.2)] select-none cursor-pointer"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Area: AI Crop Recommendations (Takes 2/5 width) */}
          <div className="lg:col-span-2 flex flex-col overflow-hidden bg-white/[0.02] border border-white/5 rounded-3xl p-5 relative">
            <div className="flex items-center gap-2 mb-3">
              <BrainCircuit className="w-5 h-5 text-accent animate-pulse" />
              <h4 className="font-extrabold text-sm text-white">AI Crop Advisor</h4>
            </div>
            
            <p className="text-[10px] text-muted-foreground leading-normal mb-4">
              Satellite recommendations tailored to crop parameters for your region (e.g. {user?.region || "Central India"}).
            </p>

            <div className="flex-1 overflow-y-auto pr-1 text-left text-xs space-y-2 custom-scrollbar font-mono leading-relaxed text-slate-300">
              {loadingAI ? (
                <div className="h-full flex flex-col items-center justify-center py-12 gap-3">
                  <div className="w-8 h-8 border-3 border-accent/20 border-t-accent rounded-full animate-spin" />
                  <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest animate-pulse">Consulting Gemini AI...</span>
                </div>
              ) : aiRecs ? (
                <div className="whitespace-pre-line leading-relaxed text-[11px] p-3 bg-black/40 rounded-xl border border-white/5">
                  {aiRecs}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-12 text-center text-muted-foreground text-[10px] gap-1 leading-relaxed">
                  <Info className="w-5 h-5 opacity-40 mb-1" />
                  <span>[Gemini Offline]</span>
                  <span>Sign in to access AI recommendations.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
