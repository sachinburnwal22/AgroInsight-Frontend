"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Leaf, Mail, Lock, Upload, ArrowRight } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/utils";

export default function LoginPage() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [idFile, setIdFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIdFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/login`, formData);
      toast.success("Welcome back!");
      login(response.data.token, response.data.user);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a] text-foreground overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[100px]"
          animate={{ x: [0, -50, 0], y: [0, 50, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px]"
          animate={{ x: [0, 50, 0], y: [0, -50, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-md p-8"
      >
        <div className="bg-card/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-primary to-secondary" />
          
          <div className="text-center mb-8">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="w-16 h-16 bg-gradient-to-br from-accent/20 to-primary/20 rounded-2xl mx-auto flex items-center justify-center mb-4 border border-accent/30"
            >
              <Leaf className="w-8 h-8 text-accent" />
            </motion.div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-muted-foreground mt-2">Log in to your AgroInsight dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-5">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                <input
                  type="email"
                  required
                  placeholder="Email Address"
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/40 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                <input
                  type="password"
                  required
                  placeholder="Password"
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/40 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              {/* ID Upload UI */}
              <div className="relative group">
                <input
                  type="file"
                  id="id-upload-login"
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                />
                <label 
                  htmlFor="id-upload-login"
                  className="w-full flex items-center justify-center gap-3 bg-black/20 border border-dashed border-white/20 hover:border-accent/50 rounded-xl py-4 cursor-pointer transition-all group-hover:bg-black/30"
                >
                  <Upload className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
                  <span className="text-sm text-white/70 group-hover:text-white transition-colors">
                    {idFile ? idFile.name : "Login with ID Upload (Optional)"}
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end">
              <Link href="#" className="text-sm text-accent hover:text-white transition-colors">
                Forgot password?
              </Link>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-black font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-accent/25 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
            >
              {loading ? "Logging in..." : "Log In"}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </motion.button>
          </form>

          <p className="text-center text-muted-foreground mt-6 text-sm">
            Don't have an account?{" "}
            <Link href="/signup" className="text-accent hover:text-primary font-semibold transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
