"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Leaf, User, Mail, Lock, MapPin, Upload, ArrowRight } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function SignupPage() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    region: "",
  });
  const [idFile, setIdFile] = useState<File | null>(null);

  const regions = [
    "North India",
    "South India",
    "East India",
    "West India",
    "Central India",
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIdFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirmation) {
      toast.error("Passwords do not match");
      return;
    }
    
    setLoading(true);
    try {
      // For this UI, we just send JSON to register endpoint. 
      // ID is just for show as requested.
      const response = await axios.post("http://127.0.0.1:8000/api/register", formData);
      toast.success("Account created successfully!");
      login(response.data.token, response.data.user);
    } catch (error: any) {
      const errMessage = error.response?.data?.message || "Registration failed";
      toast.error(errMessage);
      if (error.response?.data?.errors) {
        Object.values(error.response.data.errors).forEach((err: any) => toast.error(err[0]));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a] text-foreground overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px]"
          animate={{ x: [0, 50, 0], y: [0, -50, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[100px]"
          animate={{ x: [0, -50, 0], y: [0, 50, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-xl p-8"
      >
        <div className="bg-card/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-secondary" />
          
          <div className="text-center mb-8">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl mx-auto flex items-center justify-center mb-4 border border-primary/30"
            >
              <Leaf className="w-8 h-8 text-primary" />
            </motion.div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              Join AgroInsight
            </h1>
            <p className="text-muted-foreground mt-2">Empowering farmers with intelligent insights</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-5">
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  required
                  placeholder="Email Address"
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type="password"
                    required
                    placeholder="Password"
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type="password"
                    required
                    placeholder="Confirm Password"
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                    value={formData.password_confirmation}
                    onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                  />
                </div>
              </div>

              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <select
                  required
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all appearance-none cursor-pointer"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                >
                  <option value="" disabled className="bg-background text-muted-foreground">Select Region</option>
                  {regions.map((region) => (
                    <option key={region} value={region} className="bg-[#1a1a2e] text-white">
                      {region}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <span className="text-muted-foreground text-xs">▼</span>
                </div>
              </div>

              {/* ID Upload UI */}
              <div className="relative group">
                <input
                  type="file"
                  id="id-upload"
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                />
                <label 
                  htmlFor="id-upload"
                  className="w-full flex items-center justify-center gap-3 bg-black/20 border border-dashed border-white/20 hover:border-primary/50 rounded-xl py-4 cursor-pointer transition-all group-hover:bg-black/30"
                >
                  <Upload className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-sm text-white/70 group-hover:text-white transition-colors">
                    {idFile ? idFile.name : "Upload Aadhaar / ID (Optional)"}
                  </span>
                </label>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-black font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/25 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
            >
              {loading ? "Creating Account..." : "Create Account"}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </motion.button>
          </form>

          <p className="text-center text-muted-foreground mt-6 text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:text-accent font-semibold transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
