"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/lib/utils";
import FloatingNavbar from "@/components/ui/FloatingNavbar";
import {
  Newspaper,
  BookOpen,
  Search,
  Filter,
  MapPin,
  Calendar,
  Sparkles,
  Bookmark,
  Volume2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Info,
  CheckCircle,
  HelpCircle,
  ArrowUpRight,
  RefreshCw,
  MessageSquare
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

// Multi-language UI translations dictionary
const translations: { [key: string]: { [key: string]: string } } = {
  English: {
    title: "AgriIntel Center",
    subtitle: "Real-time AI-powered agricultural command center",
    breaking: "BREAKING:",
    searchPlaceholder: "Search news, schemes or alerts...",
    filters: "Filters",
    stateLabel: "State",
    cropLabel: "Crop",
    categoryLabel: "Category",
    resetFilters: "Reset Filters",
    tabNews: "Live News & AI Insights",
    tabSchemes: "Government Schemes",
    trending: "Trending Agricultural Topics",
    readMore: "Read Full Article & AI Summary",
    applyNow: "Apply Online",
    benefits: "Benefits Offered",
    eligibility: "Eligibility Criteria",
    aiExplainer: "AI Explainer",
    stateAvailable: "State Availability",
    noNews: "No agricultural news found matching the criteria.",
    noSchemes: "No government schemes found matching the criteria.",
    savedOnly: "Saved Articles Only",
    recommendedTitle: "AI Advisor Recommendations",
    recommendedSubtitle: "Based on your region and crops",
  },
  Hindi: {
    title: "एग्री-इंटेल केंद्र",
    subtitle: "वास्तविक समय एआई-संचालित कृषि कमान केंद्र",
    breaking: "ताज़ा खबर:",
    searchPlaceholder: "समाचार, योजनाएं या अलर्ट खोजें...",
    filters: "फिल्टर",
    stateLabel: "राज्य",
    cropLabel: "फसल",
    categoryLabel: "श्रेणी",
    resetFilters: "फिल्टर हटाएं",
    tabNews: "लाइव समाचार और एआई अंतर्दृष्टि",
    tabSchemes: "सरकारी योजनाएं",
    trending: "प्रचलित कृषि विषय",
    readMore: "पूरा लेख और एआई सारांश पढ़ें",
    applyNow: "ऑनलाइन आवेदन करें",
    benefits: "प्रदान किए जाने वाले लाभ",
    eligibility: "पात्रता मानदंड",
    aiExplainer: "एआई स्पष्टीकरण",
    stateAvailable: "राज्य उपलब्धता",
    noNews: "मापदंड से मेल खाते कोई कृषि समाचार नहीं मिले।",
    noSchemes: "मापदंड से मेल खाती कोई सरकारी योजनाएं नहीं मिलीं।",
    savedOnly: "केवल सहेजे गए लेख",
    recommendedTitle: "एआई सलाहकार सिफारिशें",
    recommendedSubtitle: "आपके क्षेत्र और फसलों के आधार पर",
  },
  Punjabi: {
    title: "ਐਗਰੀ-ਇੰਟੈੱਲ ਕੇਂਦਰ",
    subtitle: "ਰੀਅਲ-ਟਾਈਮ ਏਆਈ-ਸੰਚਾਲਿਤ ਖੇਤੀਬਾੜੀ ਕਮਾਂਡ ਕੇਂਦਰ",
    breaking: "ਤਾਜ਼ਾ ਖ਼ਬਰ:",
    searchPlaceholder: "ਖ਼ਬਰਾਂ, ਯੋਜਨਾਵਾਂ ਜਾਂ ਅਲਰਟ ਲੱਭੋ...",
    filters: "ਫਿਲਟਰ",
    stateLabel: "ਰਾਜ",
    cropLabel: "ਫਸਲ",
    categoryLabel: "ਸ਼੍ਰੇਣੀ",
    resetFilters: "ਫਿਲਟਰ ਹਟਾਓ",
    tabNews: "ਲਾਈਵ ਖ਼ਬਰਾਂ ਅਤੇ ਏਆਈ ਸੂਝ-ਬੂਝ",
    tabSchemes: "ਸਰਕਾਰੀ ਯੋਜਨਾਵਾਂ",
    trending: "ਪ੍ਰਚਲਿਤ ਖੇਤੀਬਾੜੀ ਵਿਸ਼ੇ",
    readMore: "ਪੂਰਾ ਲੇਖ ਅਤੇ ਏਆਈ ਸਾਰਾਂਸ਼ ਪੜ੍ਹੋ",
    applyNow: "ਆਨਲਾਈਨ ਅਪਲਾਈ ਕਰੋ",
    benefits: "ਮਿਲਣ ਵਾਲੇ ਲਾਭ",
    eligibility: "ਪਾਤਰਤਾ ਮਾਪਦੰਡ",
    aiExplainer: "ਏਆਈ ਸਪਸ਼ਟੀਕਰਨ",
    stateAvailable: "ਰਾਜ ਉਪਲਬਧਤਾ",
    noNews: "ਮਾਪਦੰਡ ਨਾਲ ਮੇਲ ਖਾਂਦੀਆਂ ਕੋਈ ਖੇਤੀਬਾੜੀ ਖ਼ਬਰਾਂ ਨਹੀਂ ਮਿਲੀਆਂ।",
    noSchemes: "ਮਾਪਦੰਡ ਨਾਲ ਮੇਲ ਖਾਂਦੀਆਂ ਕੋਈ ਸਰਕਾਰੀ ਯੋਜਨਾਵਾਂ ਨਹੀਂ ਮਿਲੀਆਂ।",
    savedOnly: "ਸਿਰਫ਼ ਬੁੱਕਮਾਰਕ ਕੀਤੀਆਂ ਖ਼ਬਰਾਂ",
    recommendedTitle: "ਏਆਈ ਸਲਾਹਕਾਰ ਸਿਫਾਰਸ਼ਾਂ",
    recommendedSubtitle: "ਤੁਹਾਡੇ ਖੇਤਰ ਅਤੇ ਫਸਲਾਂ ਦੇ ਅਧਾਰ ਤੇ",
  },
  Bengali: {
    title: "এগ্রি-ইন্টেল সেন্টার",
    subtitle: "রিয়েল-টাইম এআই-চালিত কৃষি কমান্ড সেন্টার",
    breaking: "ব্রেকিং নিউজ:",
    searchPlaceholder: "খবর, প্রকল্প বা অ্যালার্ট খুঁজুন...",
    filters: "ফিল্টার",
    stateLabel: "রাজ্য",
    cropLabel: "ফসল",
    categoryLabel: "বিভাগ",
    resetFilters: "ফিল্টার মুছুন",
    tabNews: "লাইভ খবর ও এআই অন্তর্দৃষ্টি",
    tabSchemes: "সরকারি প্রকল্পসমূহ",
    trending: "চলতি কৃষি বিষয়াবলী",
    readMore: "সম্পূর্ণ নিবন্ধ ও এআই সারাংশ পড়ুন",
    applyNow: "অনলাইনে আবেদন করুন",
    benefits: "প্রদেয় সুবিধাসমূহ",
    eligibility: "যোগ্যতার মানদণ্ড",
    aiExplainer: "এআই ব্যাখ্যা",
    stateAvailable: "রাজ্য প্রাপ্যতা",
    noNews: "নির্ধারিত মানদণ্ডের সাথে মেলে এমন কোনো কৃষি খবর পাওয়া যায়নি।",
    noSchemes: "নির্ধারিত মানদণ্ডের সাথে মেলে এমন কোনো সরকারি প্রকল্প পাওয়া যায়নি।",
    savedOnly: "শুধুমাত্র সংরক্ষিত নিবন্ধ",
    recommendedTitle: "এআই উপদেষ্টা সুপারিশ",
    recommendedSubtitle: "আপনার অঞ্চল ও ফসলের ভিত্তিতে",
  },
  Tamil: {
    title: "அக்ரி-இன்டெல் மையம்",
    subtitle: "உண்நேர ஏஐ-இயங்கும் விவசாய கட்டுப்பாட்டு மையம்",
    breaking: "முக்கிய செய்தி:",
    searchPlaceholder: "செய்திகள், திட்டங்கள் அல்லது எச்சரிக்கைகளைத் தேடுங்கள்...",
    filters: "வடிப்பான்கள்",
    stateLabel: "மாநிலம்",
    cropLabel: "பயிர்",
    categoryLabel: "வகை",
    resetFilters: "வடிப்பான்களை நீக்கு",
    tabNews: "நேரடி செய்திகள் & ஏஐ நுண்ணறிவு",
    tabSchemes: "அரசு திட்டங்கள்",
    trending: "பிரபலமான விவசாய தலைப்புகள்",
    readMore: "முழு கட்டுரை மற்றும் ஏஐ சுருக்கத்தைப் படியுங்கள்",
    applyNow: "ஆன்லைனில் விண்ணப்பிக்கவும்",
    benefits: "வழங்கப்படும் நன்மைகள்",
    eligibility: "தகுதி வரம்புகள்",
    aiExplainer: "ஏஐ விளக்கம்",
    stateAvailable: "மாநில கிடைக்கும் தன்மை",
    noNews: "விவரங்களுடன் பொருந்தக்கூடிய விவசாய செய்திகள் எதுவும் இல்லை.",
    noSchemes: "விவரங்களுடன் பொருந்தக்கூடிய அரசு திட்டங்கள் எதுவும் இல்லை.",
    savedOnly: "சேமிக்கப்பட்ட கட்டுரைகள் மட்டும்",
    recommendedTitle: "ஏஐ ஆலோசகர் பரிந்துரைகள்",
    recommendedSubtitle: "உங்கள் பிராந்தியம் மற்றும் பயிர்களின் அடிப்படையில்",
  }
};

const CATEGORIES = ["Crops", "Weather", "MSP", "Insurance", "Technology", "Organic farming"];
const STATES = ["All India", "Punjab", "Haryana", "Uttar Pradesh", "Maharashtra", "Tamil Nadu", "West Bengal"];

export default function AgriIntelPage() {
  const { user } = useAuth();
  
  // Interface States
  const [activeTab, setActiveTab] = useState<"news" | "schemes">("news");
  const [language, setLanguage] = useState<string>("English");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCrop, setSelectedCrop] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showSavedOnly, setShowSavedOnly] = useState<boolean>(false);
  
  // Data States
  const [newsList, setNewsList] = useState<any[]>([]);
  const [trendingNews, setTrendingNews] = useState<any[]>([]);
  const [schemesList, setSchemesList] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [savedArticleIds, setSavedArticleIds] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  
  // AI Explainer Modal States
  const [explainerOpen, setExplainerOpen] = useState<boolean>(false);
  const [selectedScheme, setSelectedScheme] = useState<any>(null);
  const [explanation, setExplanation] = useState<string>("");
  const [explainerLoading, setExplainerLoading] = useState<boolean>(false);
  const [explainerLanguage, setExplainerLanguage] = useState<string>("English");
  
  // Carousel Hero news index
  const [heroIdx, setHeroIdx] = useState<number>(0);

  // Fetch all initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // 1. Fetch live news (with current filters)
      const newsParams: any = {};
      if (selectedState) newsParams.state = selectedState;
      if (selectedCrop) newsParams.crop = selectedCrop;
      if (selectedCategory) newsParams.category = selectedCategory;
      if (searchQuery) newsParams.search = searchQuery;

      const newsRes = await axios.get(`${API_BASE_URL}/api/news/live`, {
        headers,
        params: newsParams
      });
      setNewsList(newsRes.data.data?.data || []);

      // 2. Fetch trending
      const trendingRes = await axios.get(`${API_BASE_URL}/api/news/trending`, { headers });
      setTrendingNews(trendingRes.data.data || []);

      // 3. Fetch schemes
      const schemeParams: any = {};
      if (selectedState) schemeParams.state = selectedState;
      if (selectedCategory) schemeParams.category = selectedCategory;
      if (searchQuery) schemeParams.search = searchQuery;

      const schemesRes = await axios.get(`${API_BASE_URL}/api/schemes/all`, {
        headers,
        params: schemeParams
      });
      setSchemesList(schemesRes.data.data || []);

      // 4. Fetch alerts
      const alertsRes = await axios.get(`${API_BASE_URL}/api/alerts/government`, { headers });
      setAlerts(alertsRes.data.data || []);

      // 5. Fetch saved article ids if logged in
      if (token) {
        const savedRes = await axios.get(`${API_BASE_URL}/api/articles/saved`, { headers });
        const ids = (savedRes.data.data || []).map((art: any) => art.id);
        setSavedArticleIds(ids);
      }
    } catch (err) {
      console.error("Failed to load agricultural intelligence data", err);
      toast.error("Failed to load live data. Check backend connectivity.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedState, selectedCrop, selectedCategory, searchQuery]);

  // Handle personalized settings from user profile
  const enablePersonalization = () => {
    if (!user) {
      toast.error("Please login to apply personalized settings");
      return;
    }
    if (user.region) {
      setSelectedState(user.region);
      toast.success(`Filters customized to your region: ${user.region}`);
    } else {
      toast.warning("No region set in your profile. Update settings to personalize.");
    }
  };

  // Sync news manually
  const handleManualSync = async () => {
    setSyncing(true);
    try {
      const token = localStorage.getItem("auth_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      toast.info("Connecting to Agricultural open portals...");
      const res = await axios.get(`${API_BASE_URL}/api/news/live`, { headers });
      setNewsList(res.data.data?.data || []);
      toast.success("Intelligence feed updated from live API sources.");
    } catch (err) {
      toast.error("Failed to synchronise new data.");
    } finally {
      setSyncing(false);
    }
  };

  // Toggle Save/Bookmark
  const toggleSaveArticle = async (articleId: number) => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      toast.error("Please log in to save articles");
      return;
    }

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/articles/save`,
        { article_id: articleId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.is_saved) {
        setSavedArticleIds((prev) => [...prev, articleId]);
        toast.success("Article saved to bookmarks.");
      } else {
        setSavedArticleIds((prev) => prev.filter((id) => id !== articleId));
        toast.info("Article removed from bookmarks.");
      }
    } catch (err) {
      toast.error("Failed to save article");
    }
  };

  // AI Explain Scheme Trigger
  const triggerExplainScheme = async (scheme: any) => {
    setSelectedScheme(scheme);
    setExplanation("");
    setExplainerLanguage(language);
    setExplainerOpen(true);
    setExplainerLoading(true);

    try {
      const token = localStorage.getItem("auth_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const res = await axios.post(
        `${API_BASE_URL}/api/schemes/${scheme.id}/explain`,
        { language },
        { headers }
      );

      setExplanation(res.data.explanation);
    } catch (err) {
      console.error(err);
      setExplanation("### Error\nFailed to reach AI Scheme Explainer. Using default scheme description.");
    } finally {
      setExplainerLoading(false);
    }
  };

  // Regenerate Explainer on language switch in sidebar drawer
  const changeExplainerLang = async (lang: string) => {
    setExplainerLanguage(lang);
    setExplainerLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const res = await axios.post(
        `${API_BASE_URL}/api/schemes/${selectedScheme.id}/explain`,
        { language: lang },
        { headers }
      );
      setExplanation(res.data.explanation);
    } catch (err) {
      toast.error("Failed to translate explanation");
    } finally {
      setExplainerLoading(false);
    }
  };

  // Auto transition hero news
  useEffect(() => {
    if (trendingNews.length === 0) return;
    const timer = setInterval(() => {
      setHeroIdx((prev) => (prev + 1) % Math.min(trendingNews.length, 3));
    }, 6000);
    return () => clearInterval(timer);
  }, [trendingNews]);

  // UI local helper
  const t = translations[language] || translations["English"];

  // Filter list locally for saved articles if clicked
  const visibleNews = showSavedOnly 
    ? newsList.filter(art => savedArticleIds.includes(art.id))
    : newsList;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#070716] via-[#0b0a24] to-[#120f3a] text-foreground overflow-x-hidden font-sans">
      <FloatingNavbar />

      {/* Cyberpunk Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1d1b3f15_1px,transparent_1px),linear-gradient(to_bottom,#1d1b3f15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 relative z-10">
        
        {/* Top Alerts / Ticker (Feature 6) */}
        {alerts.length > 0 && (
          <div className="w-full bg-[#0a0a1a]/85 border-y border-primary/20 backdrop-blur-md py-2.5 mb-8 rounded-xl overflow-hidden relative flex items-center shadow-[0_0_15px_rgba(0,208,132,0.05)]">
            <div className="px-4 font-black text-xs text-primary tracking-widest uppercase flex items-center gap-1.5 shrink-0 border-r border-primary/30 mr-4">
              <span className="w-2.5 h-2.5 rounded-full bg-accent animate-ping" />
              {t.breaking}
            </div>
            
            <div className="relative w-full overflow-hidden h-5 flex items-center">
              <motion.div
                className="flex whitespace-nowrap gap-12 text-sm font-semibold tracking-wide text-white/90"
                animate={{ x: ["100%", "-100%"] }}
                transition={{
                  repeat: Infinity,
                  duration: 70,
                  ease: "linear"
                }}
              >
                {alerts.map((al, idx) => (
                  <span key={al.id || idx} className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      al.severity === 'severe' ? 'bg-red-500' : al.severity === 'moderate' ? 'bg-orange-500' : 'bg-primary'
                    }`} />
                    <span className="text-muted-foreground">[{al.state}]</span> {al.title}: {al.message}
                  </span>
                ))}
              </motion.div>
            </div>
          </div>
        )}

        {/* Dashboard Title & Language Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3"
            >
              <div className="p-2.5 bg-gradient-to-br from-primary to-accent rounded-xl border border-white/10 shadow-[0_0_15px_rgba(0,208,132,0.25)] text-black">
                <Newspaper className="w-6 h-6" />
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                {t.title}
              </h1>
            </motion.div>
            <p className="text-sm text-muted-foreground mt-2 font-mono uppercase tracking-wider pl-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
              {t.subtitle}
            </p>
          </div>

          {/* Languages Selector */}
          <div className="flex items-center gap-2 bg-[#09091a] border border-white/5 p-1 rounded-full backdrop-blur-md shadow-lg shrink-0">
            {["English", "Hindi", "Punjabi", "Bengali", "Tamil"].map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  language === lang
                    ? "bg-primary text-black shadow-[0_0_12px_rgba(0,208,132,0.3)]"
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                }`}
              >
                {lang === "Punjabi" ? "ਪੰਜਾਬੀ" : lang === "Tamil" ? "தமிழ்" : lang === "Bengali" ? "বাংলা" : lang === "Hindi" ? "हिंदी" : "EN"}
              </button>
            ))}
          </div>
        </div>

        {/* HERO CAROUSEL: Feature 1 Top Trending News */}
        {trendingNews.length > 0 && (
          <div className="mb-10 relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl h-[340px] md:h-[420px] bg-[#050512]">
            <AnimatePresence mode="wait">
              {trendingNews.map((tn, idx) => {
                if (idx !== heroIdx) return null;
                return (
                  <motion.div
                    key={tn.id}
                    className="absolute inset-0 flex flex-col justify-end p-6 md:p-12"
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    {/* Background Hero Image */}
                    <div className="absolute inset-0 z-0">
                      <img
                        src={tn.image}
                        alt={tn.title}
                        className="w-full h-full object-cover brightness-[0.4] transition-all duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#060613] via-[#060613]/50 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 max-w-3xl">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="px-3 py-1 text-[10px] uppercase font-black tracking-widest bg-primary/20 border border-primary/30 rounded-md text-primary font-mono">
                          {tn.category}
                        </span>
                        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5 text-accent animate-pulse" />
                          TRENDING UPDATE
                        </span>
                      </div>
                      
                      <h2 className="text-2xl md:text-4xl font-extrabold text-white leading-tight mb-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        {tn.title}
                      </h2>
                      
                      <p className="text-sm md:text-base text-gray-300 line-clamp-2 md:line-clamp-3 mb-6 font-medium">
                        {tn.summary}
                      </p>

                      <div className="flex flex-wrap items-center gap-4">
                        <Link href={`/agri-intel/news/${tn.id}?lang=${language}`}>
                          <button className="px-6 py-3 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-black font-bold rounded-xl text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,208,132,0.3)] transition-all cursor-pointer flex items-center gap-2 group">
                            <span>{t.readMore}</span>
                            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                          </button>
                        </Link>

                        <button
                          onClick={() => toggleSaveArticle(tn.id)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer ${
                            savedArticleIds.includes(tn.id)
                              ? "bg-primary/20 border-primary text-primary"
                              : "bg-white/5 border-white/10 text-muted-foreground hover:text-white"
                          }`}
                        >
                          <Bookmark className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Slider Dots */}
            <div className="absolute bottom-6 right-8 z-20 flex gap-2">
              {trendingNews.slice(0, 3).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setHeroIdx(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                    heroIdx === idx ? "bg-primary w-6" : "bg-white/20 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* SEARCH, FILTERS & ADVISORY PANEL */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-10">
          
          {/* Main Controls Panel (Left Col 3) */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Search and Filters Drawer Toggle */}
            <div className="bg-[#0c0c24]/75 border border-white/5 p-4 rounded-2xl backdrop-blur-md shadow-xl flex flex-col md:flex-row gap-4 items-center">
              
              {/* Search Bar */}
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#050512] border border-white/10 focus:border-primary/40 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none text-white transition-all font-medium"
                />
              </div>

              {/* Dynamic manual reload / sync */}
              <div className="flex gap-2 w-full md:w-auto shrink-0 justify-end">
                <button
                  onClick={handleManualSync}
                  disabled={syncing}
                  className="p-3 bg-[#0a0a1c] border border-white/10 hover:border-primary/40 rounded-xl transition-all text-primary cursor-pointer disabled:opacity-50"
                  title="Synchronize Live Intelligence"
                >
                  <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                </button>

                {user && (
                  <button
                    onClick={enablePersonalization}
                    className="px-4 py-3 bg-[#050512]/60 border border-primary/30 hover:bg-primary/10 text-primary font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,208,132,0.1)]"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Personalize
                  </button>
                )}
              </div>
            </div>

            {/* Filter Hub */}
            <div className="bg-[#0b0a23]/40 border border-white/5 p-5 rounded-2xl backdrop-blur-md flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase border-r border-white/10 pr-4 mr-2 shrink-0">
                <Filter className="w-3.5 h-3.5" />
                {t.filters}
              </div>

              {/* State Filter */}
              <div className="flex flex-col gap-1 shrink-0">
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="bg-[#050510] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary/40"
                >
                  <option value="">{t.stateLabel} (All)</option>
                  {STATES.map(s => (
                    <option key={s} value={s === "All India" ? "" : s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Crop Filter */}
              <div className="flex flex-col gap-1 shrink-0">
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="bg-[#050510] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary/40"
                >
                  <option value="">{t.cropLabel} (All)</option>
                  <option value="Wheat">Wheat</option>
                  <option value="Rice">Rice</option>
                  <option value="Cotton">Cotton</option>
                  <option value="Sugarcane">Sugarcane</option>
                </select>
              </div>

              {/* Category Filter */}
              <div className="flex flex-col gap-1 shrink-0">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-[#050510] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary/40"
                >
                  <option value="">{t.categoryLabel} (All)</option>
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Saved Articles Toggle */}
              {user && (
                <button
                  onClick={() => setShowSavedOnly(!showSavedOnly)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    showSavedOnly
                      ? "bg-primary/20 border-primary text-primary"
                      : "bg-[#050510] border-white/10 text-muted-foreground hover:text-white"
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  {t.savedOnly}
                </button>
              )}

              {/* Reset */}
              {(selectedState || selectedCrop || selectedCategory || searchQuery || showSavedOnly) && (
                <button
                  onClick={() => {
                    setSelectedState("");
                    setSelectedCrop("");
                    setSelectedCategory("");
                    setSearchQuery("");
                    setShowSavedOnly(false);
                    toast.info("Filters reset.");
                  }}
                  className="text-xs font-bold text-accent hover:underline cursor-pointer ml-auto"
                >
                  {t.resetFilters}
                </button>
              )}
            </div>
          </div>

          {/* Right Col 1: AI Advisor recommendations widget (Feature 10) */}
          <div className="bg-gradient-to-b from-[#0e0e29] to-[#08081c] border border-primary/20 p-5 rounded-3xl backdrop-blur-md shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                <h3 className="text-sm font-black tracking-wider text-white uppercase font-mono">
                  {t.recommendedTitle}
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                {t.recommendedSubtitle}
              </p>

              {user ? (
                <div className="space-y-3.5">
                  <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-xs">
                    <span className="text-[10px] text-primary uppercase font-bold tracking-widest font-mono">
                      State / Location
                    </span>
                    <p className="text-white font-bold mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-accent" />
                      {user.region || "Not Configured"}
                    </p>
                  </div>

                  <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-xs">
                    <span className="text-[10px] text-primary uppercase font-bold tracking-widest font-mono">
                      Advisory Tip
                    </span>
                    <p className="text-gray-300 font-medium mt-1 leading-relaxed">
                      {user.region === "Punjab"
                        ? "Ensure light evening irrigation for cotton crops to avoid leaf wilting during heatwaves."
                        : "Track the latest crop insurance guidelines for Kharif paddy seeding."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 border border-white/5 bg-[#050512]/60 rounded-2xl text-center">
                  <HelpCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Log in to unlock personalized schemes, weather advisories, and state announcements.
                  </p>
                </div>
              )}
            </div>

            {user && (
              <div className="mt-4 pt-4 border-t border-white/5">
                <Link href="/crop-recommendation" className="text-xs font-bold text-primary hover:underline flex items-center justify-between">
                  <span>Open Crop Advisor</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* WORKSPACE CONTENT TABS */}
        <div className="mb-12">
          
          {/* Tab selectors */}
          <div className="flex gap-4 border-b border-white/5 pb-4 mb-8">
            <button
              onClick={() => setActiveTab("news")}
              className={`pb-2 px-1 text-base md:text-lg font-bold tracking-wide relative transition-all cursor-pointer ${
                activeTab === "news" ? "text-primary" : "text-muted-foreground hover:text-white"
              }`}
            >
              <span className="flex items-center gap-2">
                <Newspaper className="w-5 h-5" />
                {t.tabNews}
              </span>
              {activeTab === "news" && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                />
              )}
            </button>

            <button
              onClick={() => setActiveTab("schemes")}
              className={`pb-2 px-1 text-base md:text-lg font-bold tracking-wide relative transition-all cursor-pointer ${
                activeTab === "schemes" ? "text-primary" : "text-muted-foreground hover:text-white"
              }`}
            >
              <span className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                {t.tabSchemes}
              </span>
              {activeTab === "schemes" && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                />
              )}
            </button>
          </div>

          {/* TAB VIEW 1: LIVE NEWS */}
          {activeTab === "news" && (
            <div>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <RefreshCw className="w-10 h-10 text-primary animate-spin" />
                  <p className="text-sm font-mono text-muted-foreground">LOADING LIVE INTELLIGENCE FEED...</p>
                </div>
              ) : visibleNews.length === 0 ? (
                <div className="text-center py-16 bg-[#0c0c24]/40 border border-white/5 rounded-3xl max-w-xl mx-auto">
                  <Info className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-60" />
                  <p className="text-gray-300 font-semibold">{t.noNews}</p>
                </div>
              ) : (
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.08 }
                    }
                  }}
                >
                  {visibleNews.map((news) => (
                    <motion.div
                      key={news.id}
                      className="group bg-[#0c0c24]/60 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_25px_rgba(0,208,132,0.05)]"
                      variants={{
                        hidden: { y: 20, opacity: 0 },
                        visible: { y: 0, opacity: 1 }
                      }}
                    >
                      {/* News Card Head (Image & Tags) */}
                      <div className="relative h-48 overflow-hidden bg-black shrink-0">
                        <img
                          src={news.image}
                          alt={news.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-4 left-4 flex gap-2">
                          <span className="px-2.5 py-1 bg-black/85 backdrop-blur-md rounded-md text-[9px] font-black uppercase tracking-widest text-primary border border-primary/20">
                            {news.category}
                          </span>
                        </div>

                        <button
                          onClick={() => toggleSaveArticle(news.id)}
                          className={`absolute top-4 right-4 p-2 bg-black/85 backdrop-blur-md rounded-lg border transition-all cursor-pointer ${
                            savedArticleIds.includes(news.id)
                              ? "border-primary text-primary"
                              : "border-white/10 text-muted-foreground hover:text-white"
                          }`}
                        >
                          <Bookmark className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Card Content */}
                      <div className="p-5 flex-grow flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono mb-2">
                            <span>{news.source}</span>
                            <span>{new Date(news.published_at).toLocaleDateString()}</span>
                          </div>

                          <h3 className="text-base font-bold text-white leading-snug line-clamp-2 group-hover:text-primary transition-colors mb-2.5">
                            {news.title}
                          </h3>

                          <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed mb-4">
                            {news.summary}
                          </p>
                        </div>

                        {/* Read Full & AI Advice Button */}
                        <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                          <Link href={`/agri-intel/news/${news.id}?lang=${language}`} className="text-xs font-extrabold text-primary group-hover:underline flex items-center gap-1 cursor-pointer">
                            <span>{t.readMore}</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          )}

          {/* TAB VIEW 2: GOVERNMENT SCHEMES */}
          {activeTab === "schemes" && (
            <div>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <RefreshCw className="w-10 h-10 text-primary animate-spin" />
                  <p className="text-sm font-mono text-muted-foreground">LOADING GOVERNMENT SCHEMES DIRECTORY...</p>
                </div>
              ) : schemesList.length === 0 ? (
                <div className="text-center py-16 bg-[#0c0c24]/40 border border-white/5 rounded-3xl max-w-xl mx-auto">
                  <Info className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-60" />
                  <p className="text-gray-300 font-semibold">{t.noSchemes}</p>
                </div>
              ) : (
                <motion.div
                  className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.08 }
                    }
                  }}
                >
                  {schemesList.map((scheme) => (
                    <motion.div
                      key={scheme.id}
                      className="bg-[#0b0b23]/70 border border-white/10 rounded-3xl p-6 hover:border-primary/40 transition-all duration-300 flex flex-col justify-between shadow-2xl relative overflow-hidden group"
                      variants={{
                        hidden: { y: 20, opacity: 0 },
                        visible: { y: 0, opacity: 1 }
                      }}
                    >
                      {/* Neon Light Accent */}
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/10 via-primary/50 to-primary/10 opacity-60 group-hover:opacity-100 transition-opacity" />

                      {/* Header */}
                      <div>
                        <div className="flex justify-between items-start gap-3 mb-3">
                          <span className="px-2.5 py-1 bg-primary/20 border border-primary/30 rounded-md text-[9px] font-black uppercase tracking-widest text-primary font-mono">
                            {scheme.category}
                          </span>
                          
                          <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-accent" />
                            {t.stateAvailable}: <span className="text-white font-bold">{scheme.state}</span>
                          </div>
                        </div>

                        <h3 className="text-lg font-bold text-white leading-snug group-hover:text-primary transition-colors mb-3">
                          {scheme.name}
                        </h3>

                        <p className="text-xs text-gray-400 leading-relaxed mb-5">
                          {scheme.description}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          
                          {/* Eligibility block */}
                          <div className="p-3.5 bg-black/40 rounded-xl border border-white/5">
                            <span className="text-[10px] text-primary uppercase font-black tracking-widest font-mono flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" />
                              {t.eligibility}
                            </span>
                            <div className="text-[11px] text-gray-300 mt-2 leading-relaxed whitespace-pre-line font-medium">
                              {scheme.eligibility}
                            </div>
                          </div>

                          {/* Benefits block */}
                          <div className="p-3.5 bg-black/40 rounded-xl border border-white/5">
                            <span className="text-[10px] text-primary uppercase font-black tracking-widest font-mono flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5" />
                              {t.benefits}
                            </span>
                            <div className="text-[11px] text-gray-300 mt-2 leading-relaxed whitespace-pre-line font-medium">
                              {scheme.benefits}
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-4 border-t border-white/5 flex flex-wrap gap-4 items-center justify-between">
                        
                        {/* AI Explainer Call */}
                        <button
                          onClick={() => triggerExplainScheme(scheme)}
                          className="px-4 py-2.5 bg-gradient-to-r from-[#0d0f28] to-[#161a4c] border border-primary/30 hover:border-primary/70 text-primary font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,208,132,0.1)]"
                        >
                          <MessageSquare className="w-4 h-4" />
                          {t.aiExplainer}
                        </button>

                        {scheme.apply_link && (
                          <a
                            href={scheme.apply_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2.5 bg-primary hover:bg-primary/95 text-black font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 hover:shadow-[0_0_12px_rgba(0,208,132,0.25)]"
                          >
                            <span>{t.applyNow}</span>
                            <ArrowUpRight className="w-4 h-4" />
                          </a>
                        )}

                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* DYNAMIC DRAWERS / MODALS */}
      
      {/* 1. AI SCHEME EXPLAINER DRAWER */}
      <AnimatePresence>
        {explainerOpen && selectedScheme && (
          <>
            {/* Dark glass backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setExplainerOpen(false)}
              className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm"
            />

            {/* Explainer Sidebar Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg bg-[#070716] border-l border-primary/20 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto"
            >
              <div>
                {/* Header */}
                <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-6">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                    <h2 className="text-base font-black tracking-widest text-white uppercase font-mono">
                      AI Scheme Advisor
                    </h2>
                  </div>
                  
                  {/* Language switch inside explainer */}
                  <div className="flex items-center gap-1.5 bg-black/50 p-1 border border-white/5 rounded-full">
                    {["English", "Hindi", "Punjabi", "Tamil"].map((lang) => (
                      <button
                        key={lang}
                        onClick={() => changeExplainerLang(lang)}
                        className={`px-2 py-1 rounded-full text-[10px] font-extrabold transition-all cursor-pointer ${
                          explainerLanguage === lang
                            ? "bg-primary text-black"
                            : "text-muted-foreground hover:text-white"
                        }`}
                      >
                        {lang.substring(0, 2).toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">
                    EXPLAINING SCHEME
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1 leading-snug">
                    {selectedScheme.name}
                  </h3>
                </div>

                {/* AI Explanation Text */}
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 min-h-[300px]">
                  {explainerLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                      <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                      <p className="text-xs font-mono text-muted-foreground">CONSULTING AI ADVISOR...</p>
                    </div>
                  ) : (
                    <div className="prose prose-invert prose-xs text-gray-300 leading-relaxed font-medium text-xs whitespace-pre-line">
                      {explanation}
                    </div>
                  )}
                </div>
              </div>

              {/* Close Panel Button */}
              <div className="pt-6 border-t border-white/10 mt-6">
                <button
                  onClick={() => setExplainerOpen(false)}
                  className="w-full py-3 bg-[#0d0d21] border border-white/10 hover:border-primary/40 rounded-xl text-xs font-bold uppercase tracking-wider text-white hover:text-primary transition-all cursor-pointer"
                >
                  Close Explainer
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
