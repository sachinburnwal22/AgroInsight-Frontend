"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, MapPin, Camera, Save, LogOut, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, token, logout, updateUser, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    region: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const regions = [
    "North India",
    "South India",
    "East India",
    "West India",
    "Central India",
  ];

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (user) {
      setFormData({
        name: user.name,
        region: user.region,
      });
      if (user.profile_image) {
        setPreviewImage(`http://127.0.0.1:8000${user.profile_image}`);
      }
    }
  }, [user, authLoading, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    const data = new FormData();
    data.append("name", formData.name);
    data.append("region", formData.region);
    if (imageFile) {
      data.append("profile_image", imageFile);
    }

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/user/update", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      updateUser(response.data.user);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-foreground p-4 md:p-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px]"
          animate={{ x: [0, -50, 0], y: [0, 50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]"
          animate={{ x: [0, 50, 0], y: [0, -50, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <motion.button 
              whileHover={{ x: -5 }}
              className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </motion.button>
          </Link>
          <motion.button
            onClick={logout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="font-medium">Logout</span>
          </motion.button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-card/40 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
        >
          {/* Cover Photo Area */}
          <div className="h-48 bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 relative">
            <div className="absolute inset-0 bg-black/20" />
          </div>

          <div className="px-8 pb-8">
            <form onSubmit={handleSubmit}>
              {/* Profile Picture */}
              <div className="relative -mt-20 mb-8 flex justify-between items-end">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-2xl bg-[#1a1a2e] border-4 border-[#0a0a1a] shadow-xl overflow-hidden relative">
                    {previewImage ? (
                      <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                        <User className="w-12 h-12 text-primary/50" />
                      </div>
                    )}
                    <label 
                      htmlFor="profile-upload"
                      className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Camera className="w-6 h-6 text-white mb-1" />
                      <span className="text-xs text-white font-medium">Change</span>
                    </label>
                  </div>
                  <input
                    type="file"
                    id="profile-upload"
                    className="hidden"
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Personal Info */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-white border-b border-white/10 pb-2">Personal Information</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">Full Name</label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                          type="text"
                          required
                          className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">Email Address (Cannot be changed)</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type="email"
                          disabled
                          className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white/50 cursor-not-allowed"
                          value={user.email}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Regional Info */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-white border-b border-white/10 pb-2">Regional Settings</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">Farming Region</label>
                      <div className="relative group">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <select
                          required
                          className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all appearance-none cursor-pointer"
                          value={formData.region}
                          onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                        >
                          <option value="" disabled>Select Region</option>
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
                      <p className="text-xs text-muted-foreground mt-2">
                        Your region helps us provide personalized crop and weather recommendations.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-10 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-black font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-primary/25 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {loading ? "Saving Changes..." : "Save Changes"}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
