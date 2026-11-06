import React, { useState } from "react";
import {
  Sparkles,
  Camera,
  FileText,
  ListChecks,
  Layers,
  Calendar,
  ArrowRight,
  Flame,
  Clock,
  Search,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import { UserProfile, HistoryItem } from "../../types";
import { AdBanner } from "../AdBanner";

interface HomeScreenProps {
  profile: UserProfile;
  recentHistory: HistoryItem[];
  onSelectTool: (toolId: "ask" | "scan" | "summarize" | "quiz" | "flashcards" | "plan", prefill?: string) => void;
  onSelectHistoryItem: (item: HistoryItem) => void;
  onOpenUpgrade: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  profile,
  recentHistory,
  onSelectTool,
  onSelectHistoryItem,
  onOpenUpgrade,
}) => {
  const [quickSearch, setQuickSearch] = useState("");

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      onSelectTool("ask", quickSearch);
    }
  };

  const featureCards = [
    {
      id: "ask" as const,
      title: "Ask Academic AI",
      description: "Step-by-step explanations for tough homework",
      icon: Sparkles,
      color: "bg-blue-600 text-white",
      badge: "Popular",
    },
    {
      id: "scan" as const,
      title: "Scan Notes (OCR)",
      description: "Transcribe handwritten notebook pages & photos",
      icon: Camera,
      color: "bg-purple-600 text-white",
      badge: "Multimodal",
    },
    {
      id: "summarize" as const,
      title: "Smart Summarizer",
      description: "Extract key points & core vocabulary from readings",
      icon: FileText,
      color: "bg-indigo-600 text-white",
      badge: "High Yield",
    },
    {
      id: "quiz" as const,
      title: "Active Recall Quiz",
      description: "Generate customized practice tests from any topic",
      icon: ListChecks,
      color: "bg-rose-600 text-white",
      badge: "Self-test",
    },
    {
      id: "flashcards" as const,
      title: "Smart Flashcards",
      description: "Master definitions with 3D spaced repetition decks",
      icon: Layers,
      color: "bg-emerald-600 text-white",
      badge: "Memory",
    },
    {
      id: "plan" as const,
      title: "Study Roadmap",
      description: "Weekly syllabus customized to your exam date",
      icon: Calendar,
      color: "bg-amber-600 text-white",
      badge: "Goal Plan",
    },
  ];

  return (
    <div id="screen-home" className="space-y-5 pb-6 text-left">
      {/* Welcome Greeting & Quick Search Bar */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-500/15">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-blue-200">
              Welcome back,
            </span>
            <h1 className="text-xl font-extrabold tracking-tight">
              {profile.name || "Student"} 👋
            </h1>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-bold">
            <Flame className="w-4 h-4 fill-orange-400 text-orange-400" />
            <span>{profile.studyStreak} Day Streak</span>
          </div>
        </div>

        <p className="text-xs text-blue-100 mt-2 font-medium">
          What do you want to master today?
        </p>

        {/* Quick Search / Question Input */}
        <form onSubmit={handleQuickSubmit} className="mt-3.5 relative">
          <input
            type="text"
            value={quickSearch}
            onChange={(e) => setQuickSearch(e.target.value)}
            placeholder="Ask any question (e.g. 'How does CRISPR work?')..."
            className="w-full pl-9 pr-16 py-2.5 rounded-2xl bg-white/95 text-zinc-900 placeholder:text-zinc-400 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-white shadow-inner"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
          <button
            type="submit"
            disabled={!quickSearch.trim()}
            className="absolute right-1.5 top-1.5 px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-bold shadow-xs transition-colors"
          >
            Ask
          </button>
        </form>
      </div>

      {/* Daily Progress Tracker */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-extrabold text-sm">
            {profile.completedTasksToday}
          </div>
          <div>
            <h3 className="text-xs font-bold text-zinc-900 dark:text-white">
              Today's Study Milestones
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              {profile.completedTasksToday >= 3
                ? "Daily goal reached! Keep going."
                : `${3 - Math.min(profile.completedTasksToday, 3)} more activities to hit today's goal.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`w-2.5 h-2.5 rounded-full ${
                profile.completedTasksToday >= step
                  ? "bg-emerald-500"
                  : "bg-zinc-200 dark:bg-zinc-800"
              }`}
            />
          ))}
        </div>
      </div>

      {/* 6 Main Action Cards */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
            Study Tools
          </h2>
          <span className="text-[11px] font-medium text-zinc-400">
            {profile.educationLevel}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {featureCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                id={`card-tool-${card.id}`}
                onClick={() => onSelectTool(card.id)}
                className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 text-left transition-all hover:shadow-md group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2.5 rounded-2xl ${card.color} shadow-xs`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                      {card.badge}
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">
                    {card.description}
                  </p>
                </div>

                <div className="mt-4 pt-2 flex items-center justify-between text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                  <span>Open</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Ad Banner for Free Users */}
      <AdBanner isPremium={profile.plan === "premium"} onUpgrade={onOpenUpgrade} />

      {/* Recent Study Activity */}
      {recentHistory.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              Jump Back In
            </h3>
          </div>

          <div className="space-y-2">
            {recentHistory.slice(0, 3).map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectHistoryItem(item)}
                className="w-full p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 text-left transition-colors flex items-center justify-between gap-3"
              >
                <div className="truncate min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                      {item.type}
                    </span>
                    <span className="text-xs font-semibold text-zinc-900 dark:text-white truncate">
                      {item.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                    {item.preview}
                  </p>
                </div>

                <ArrowRight className="w-4 h-4 text-zinc-400 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
