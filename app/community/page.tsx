"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, MapPin, Plus, Check, Loader2, Sparkles, X } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function CommunityPage() {
  const { token, user } = useAuth();
  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Community Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCommunity, setNewCommunity] = useState({ name: "", region: "", description: "" });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchCommunities();
  }, [token]);

  const fetchCommunities = async () => {
    if (!token) return;
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/communities", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCommunities(response.data);
    } catch (error) {
      console.error("Failed to load communities", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinLeave = async (communityId: number, isMember: boolean) => {
    try {
      const endpoint = isMember ? '/api/community/leave' : '/api/community/join';
      await axios.post(`http://127.0.0.1:8000${endpoint}`, { community_id: communityId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCommunities(communities.map(c => {
        if (c.id === communityId) {
          return {
            ...c,
            is_member: !isMember,
            users_count: isMember ? c.users_count - 1 : c.users_count + 1
          };
        }
        return c;
      }));
      
      toast.success(isMember ? "Left community" : "Joined community!");
    } catch (error) {
      toast.error("Action failed");
    }
  };

  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/communities", newCommunity, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const createdCommunity = {
        ...response.data,
        is_member: true,
        users_count: 1
      };

      setCommunities([createdCommunity, ...communities]);
      setIsModalOpen(false);
      setNewCommunity({ name: "", region: "", description: "" });
      toast.success("Community created successfully!");
    } catch (error) {
      toast.error("Failed to create community");
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  const suggestedCommunities = communities.filter(c => user && c.region === user.region);
  const otherCommunities = communities.filter(c => !user || c.region !== user.region);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const CommunityCard = ({ community, suggested = false }: { community: any, suggested?: boolean }) => (
    <motion.div
      variants={itemVariants}
      className={`bg-card/40 backdrop-blur-xl border rounded-2xl p-6 relative overflow-hidden group ${
        suggested ? 'border-primary/50 shadow-lg shadow-primary/10' : 'border-white/10'
      }`}
    >
      {suggested && (
        <div className="absolute top-0 right-0 bg-primary text-black text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Suggested
        </div>
      )}
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
            <Link href={`/community/${community.id}`}>{community.name}</Link>
          </h3>
          <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
            <MapPin className="w-4 h-4" />
            <span>{community.region}</span>
          </div>
        </div>
        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:bg-primary/10 transition-colors">
          <Users className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground line-clamp-2 mb-6 h-10">
        {community.description}
      </p>
      
      <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-auto">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white/80">
            {community.users_count} Members
          </span>
        </div>
        
        <motion.button
          onClick={() => handleJoinLeave(community.id, community.is_member)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
            community.is_member 
              ? 'bg-white/10 text-white hover:bg-destructive/20 hover:text-destructive border border-white/20 hover:border-destructive/50'
              : 'bg-primary text-black shadow-lg shadow-primary/20 hover:shadow-primary/40'
          }`}
        >
          {community.is_member ? (
            <>
              <Check className="w-4 h-4" />
              <span>Joined</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Join</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent mb-4">
          Farming Communities
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Join regional communities, share your insights, ask questions, and learn from fellow farmers.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-bold text-white transition-colors inline-flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Create New Community
        </motion.button>
      </div>

      {suggestedCommunities.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Sparkles className="text-primary w-6 h-6" />
            Suggested for You
          </h2>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {suggestedCommunities.map(community => (
              <CommunityCard key={community.id} community={community} suggested={true} />
            ))}
          </motion.div>
        </section>
      )}

      <section>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <MapPin className="text-accent w-6 h-6" />
          Explore By Region
        </h2>
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {otherCommunities.map(community => (
            <CommunityCard key={community.id} community={community} />
          ))}
        </motion.div>
      </section>

      {/* Create Community Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 z-50 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Create Community</h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-muted-foreground hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCommunity} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Community Name</label>
                  <input
                    type="text"
                    required
                    value={newCommunity.name}
                    onChange={e => setNewCommunity({...newCommunity, name: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                    placeholder="e.g. Punjab Wheat Growers"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Region</label>
                  <select
                    required
                    value={newCommunity.region}
                    onChange={e => setNewCommunity({...newCommunity, region: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all appearance-none"
                  >
                    <option value="">Select Region</option>
                    <option value="North India">North India</option>
                    <option value="South India">South India</option>
                    <option value="East India">East India</option>
                    <option value="West India">West India</option>
                    <option value="Central India">Central India</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
                  <textarea
                    required
                    value={newCommunity.description}
                    onChange={e => setNewCommunity({...newCommunity, description: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all resize-none h-24"
                    placeholder="What is this community about?"
                  />
                </div>
                
                <div className="pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isCreating}
                    type="submit"
                    className="w-full py-3 bg-primary hover:bg-primary/90 text-black font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                    <span>Create</span>
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
