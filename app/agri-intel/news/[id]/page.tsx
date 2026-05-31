"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/lib/utils";
import FloatingNavbar from "@/components/ui/FloatingNavbar";
import {
  ChevronLeft,
  Calendar,
  User,
  Sparkles,
  Bookmark,
  Volume2,
  VolumeX,
  Play,
  Square,
  ArrowLeft,
  Share2,
  Info,
  RefreshCw,
  Newspaper
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function NewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const articleId = params.id;
  
  const { user } = useAuth();
  
  // Data States
  const [article, setArticle] = useState<any>(null);
  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);
  const [aiSummary, setAiSummary] = useState<string>("");
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [summaryLoading, setSummaryLoading] = useState<boolean>(false);
  
  // Language Configuration
  const [summaryLanguage, setSummaryLanguage] = useState<string>(searchParams.get("lang") || "English");
  
  // TTS (Text to Speech) State
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [synth, setSynth] = useState<SpeechSynthesis | null>(null);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  // Initialize Speech Synthesis
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      setSynth(window.speechSynthesis);
    }
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Fetch article detail
  const fetchArticleDetails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Since we retrieve live articles, we can fetch all news from live endpoint and locate this article
      // Or query database for it
      // Let's retrieve live news, and filter the match
      const newsRes = await axios.get(`${API_BASE_URL}/api/news/live`, { headers });
      const articlesList = newsRes.data.data?.data || [];
      const matched = articlesList.find((a: any) => String(a.id) === String(articleId));
      
      if (matched) {
        setArticle(matched);
        setRelatedArticles(articlesList.filter((a: any) => String(a.id) !== String(articleId)).slice(0, 3));
        
        // Check if saved
        if (token) {
          const savedRes = await axios.get(`${API_BASE_URL}/api/articles/saved`, { headers });
          const isSavedArticle = (savedRes.data.data || []).some((art: any) => String(art.id) === String(articleId));
          setIsSaved(isSavedArticle);
        }
      } else {
        toast.error("Article not found in the feed.");
        router.push("/agri-intel");
      }
    } catch (err) {
      console.error("Failed to load article detail", err);
      toast.error("Error fetching article details.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch AI Summary
  const fetchAiSummary = async (lang: string) => {
    setSummaryLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.post(
        `${API_BASE_URL}/api/news/${articleId}/ai-summary`,
        { language: lang },
        { headers }
      );
      
      setAiSummary(res.data.ai_summary);
    } catch (err) {
      console.error(err);
      setAiSummary("### AI Summary Error\nCould not fetch simplified farmer advice at this time.");
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    if (articleId) {
      fetchArticleDetails();
    }
  }, [articleId]);

  useEffect(() => {
    if (articleId && article) {
      fetchAiSummary(summaryLanguage);
    }
  }, [articleId, article, summaryLanguage]);

  // Handle Save/Bookmark
  const toggleSave = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      toast.error("Please log in to save articles");
      return;
    }

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/articles/save`,
        { article_id: article.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIsSaved(res.data.is_saved);
      if (res.data.is_saved) {
        toast.success("Article saved to bookmarks.");
      } else {
        toast.info("Article removed from bookmarks.");
      }
    } catch (err) {
      toast.error("Failed to save article.");
    }
  };

  // TTS Audio Player Actions
  const startSpeaking = () => {
    if (!synth || !aiSummary) return;
    
    // Cancel active voice first
    synth.cancel();

    // Clean markdown tags for text reader
    const cleanText = aiSummary
      .replace(/###/g, "")
      .replace(/##/g, "")
      .replace(/#/g, "")
      .replace(/\*/g, "")
      .replace(/•/g, "Point:");

    const newUtterance = new SpeechSynthesisUtterance(cleanText);

    // Try setting appropriate language voice
    if (summaryLanguage === "Hindi") {
      newUtterance.lang = "hi-IN";
    } else if (summaryLanguage === "Tamil") {
      newUtterance.lang = "ta-IN";
    } else if (summaryLanguage === "Bengali") {
      newUtterance.lang = "bn-IN";
    } else if (summaryLanguage === "Punjabi") {
      newUtterance.lang = "pa-IN";
    } else {
      newUtterance.lang = "en-IN";
    }

    newUtterance.onend = () => {
      setIsSpeaking(false);
    };

    newUtterance.onerror = () => {
      setIsSpeaking(false);
    };

    setIsSpeaking(true);
    setUtterance(newUtterance);
    synth.speak(newUtterance);
  };

  const stopSpeaking = () => {
    if (synth) {
      synth.cancel();
      setIsSpeaking(false);
    }
  };

  // Share Article
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article?.title,
        text: article?.summary,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Article link copied to clipboard!");
    }
  };

  if (loading || !article) {
    return (
      <div className="relative min-h-screen bg-[#070716] flex flex-col items-center justify-center gap-4 text-white">
        <RefreshCw className="w-10 h-10 text-primary animate-spin" />
        <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest">
          FETCHING AGRICULTURAL INTELLIGENCE...
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#070716] via-[#0b0a24] to-[#120f3a] text-foreground overflow-x-hidden font-sans">
      <FloatingNavbar />

      {/* Background Accent glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none z-0" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 relative z-10">
        
        {/* Back Link */}
        <Link
          href="/agri-intel"
          className="inline-flex items-center gap-2 text-xs font-mono text-primary uppercase tracking-wider hover:underline mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to AgriIntel Center
        </Link>

        {/* Title Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-primary/20 border border-primary/30 rounded-md text-xs font-black uppercase tracking-widest text-primary font-mono">
              {article.category}
            </span>
            <span className="text-xs text-muted-foreground font-mono flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {new Date(article.published_at).toLocaleDateString()}
            </span>
            <span className="text-xs text-muted-foreground font-mono flex items-center gap-1.5 ml-auto">
              <User className="w-4 h-4" />
              Source: <span className="text-white font-bold">{article.source}</span>
            </span>
          </div>

          <h1 className="text-2xl md:text-4xl font-extrabold text-white leading-tight mb-6">
            {article.title}
          </h1>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={toggleSave}
              className={`px-4 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all ${
                isSaved
                  ? "bg-primary/20 border-primary text-primary"
                  : "bg-white/5 border-white/10 text-muted-foreground hover:text-white"
              }`}
            >
              <Bookmark className="w-4 h-4" />
              {isSaved ? "Saved" : "Save Article"}
            </button>

            <button
              onClick={handleShare}
              className="px-4 py-2.5 bg-white/5 border border-white/10 hover:border-primary/40 rounded-xl text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-white flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>

        {/* Detailed Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Main news text content (Col 2) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl h-[280px] md:h-[400px] bg-black">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Article Text content */}
            <div className="p-6 md:p-8 bg-[#0c0c24]/55 border border-white/5 rounded-3xl backdrop-blur-md leading-relaxed text-gray-300 font-medium text-sm md:text-base space-y-4">
              <p>{article.content || article.summary}</p>
            </div>

            {/* RELATED ARTICLES */}
            {relatedArticles.length > 0 && (
              <div className="pt-8 border-t border-white/5">
                <h3 className="text-lg font-extrabold text-white mb-6 flex items-center gap-2">
                  <Newspaper className="w-5 h-5 text-primary" />
                  Related News & Policy Changes
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedArticles.map((art) => (
                    <Link
                      key={art.id}
                      href={`/agri-intel/news/${art.id}`}
                      className="group bg-[#09091c]/80 border border-white/5 hover:border-primary/30 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between"
                    >
                      <div className="h-32 bg-black overflow-hidden shrink-0">
                        <img
                          src={art.image}
                          alt={art.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="p-4 flex-grow flex flex-col justify-between">
                        <h4 className="text-xs font-bold text-white leading-snug line-clamp-2 group-hover:text-primary transition-colors mb-2">
                          {art.title}
                        </h4>
                        <span className="text-[9px] font-mono text-muted-foreground">
                          {art.source}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Farmer-friendly panel sidebar (Col 1) */}
          <div className="space-y-6">
            
            {/* AI Summary Widget */}
            <div className="bg-gradient-to-b from-[#0e0e29] to-[#08081c] border border-primary/20 p-6 rounded-3xl backdrop-blur-md shadow-2xl relative overflow-hidden flex flex-col justify-between">
              
              {/* Neon border strip */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary to-accent" />

              <div>
                {/* Header */}
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                    <h3 className="text-sm font-black tracking-wider text-white uppercase font-mono">
                      AI Smart Advisor
                    </h3>
                  </div>

                  {/* Language Swapper */}
                  <select
                    value={summaryLanguage}
                    onChange={(e) => setSummaryLanguage(e.target.value)}
                    className="bg-[#050510] border border-white/10 rounded-xl px-3 py-1.5 text-[10px] text-white focus:outline-none focus:border-primary/40 cursor-pointer font-bold"
                  >
                    {["English", "Hindi", "Punjabi", "Bengali", "Tamil"].map((lang) => (
                      <option key={lang} value={lang}>
                        {lang === "Punjabi" ? "ਪੰਜਾਬੀ" : lang === "Tamil" ? "தமிழ்" : lang === "Bengali" ? "বাংলা" : lang === "Hindi" ? "हिंदी" : lang}
                      </option>
                    ))}
                  </select>
                </div>

                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-4">
                  Farmer-friendly advice & translation
                </p>

                {/* AI Audio Player Panel */}
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 mb-5 flex items-center justify-between gap-4">
                  <div className="text-xs">
                    <p className="text-white font-bold flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4 text-primary animate-bounce" />
                      Voice Reader Active
                    </p>
                    <p className="text-muted-foreground text-[10px] mt-0.5 font-mono">
                      Language: {summaryLanguage}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {isSpeaking ? (
                      <button
                        onClick={stopSpeaking}
                        className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl hover:bg-red-500/35 transition-all text-red-500 cursor-pointer"
                        title="Stop Voice Reader"
                      >
                        <Square className="w-4.5 h-4.5 fill-current" />
                      </button>
                    ) : (
                      <button
                        onClick={startSpeaking}
                        disabled={summaryLoading || !aiSummary}
                        className="p-3 bg-primary/20 border border-primary/30 rounded-xl hover:bg-primary/35 transition-all text-primary cursor-pointer disabled:opacity-50"
                        title="Play Voice Reader"
                      >
                        <Play className="w-4.5 h-4.5 fill-current" />
                      </button>
                    )}
                  </div>
                </div>

                {/* AI Text Summary Output */}
                <div className="p-4 bg-black/45 rounded-2xl border border-white/5 min-h-[220px]">
                  {summaryLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                      <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                      <p className="text-[10px] font-mono text-muted-foreground">CONSULTING GEMINI ADVISOR...</p>
                    </div>
                  ) : (
                    <div className="prose prose-invert text-xs leading-relaxed text-gray-300 whitespace-pre-line font-medium">
                      {aiSummary}
                    </div>
                  )}
                </div>

              </div>

              {/* Disclaimer */}
              <div className="mt-6 pt-4 border-t border-white/5 text-[9px] text-muted-foreground flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-accent shrink-0" />
                <span>AI advice is illustrative; cross-check with district agriculture offices.</span>
              </div>
            </div>

            {/* Scheme recommendation related card */}
            <div className="bg-[#0c0c24]/85 border border-white/10 p-5 rounded-3xl text-center shadow-xl">
              <span className="text-[9px] text-accent uppercase font-black tracking-widest font-mono">
                Matching Schemes
              </span>
              <p className="text-xs text-gray-300 font-semibold mt-2 leading-relaxed">
                Looking for subsidies related to this? Open Government Schemes to apply.
              </p>
              <Link href="/agri-intel">
                <button className="w-full mt-4 py-2.5 bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer">
                  Browse Schemes Directory
                </button>
              </Link>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
