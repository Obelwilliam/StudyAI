import React from "react";
import { Sparkles, Crown, ExternalLink } from "lucide-react";

interface AdBannerProps {
  isPremium: boolean;
  onUpgrade: () => void;
}

export const AdBanner: React.FC<AdBannerProps> = ({ isPremium, onUpgrade }) => {
  // Premium users see no ads
  if (isPremium) return null;

  return (
    <div
      id="ad-banner-sponsored"
      className="my-3 p-3 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-zinc-800/80 dark:to-zinc-800/40 border border-blue-100 dark:border-zinc-700/60 flex items-center justify-between gap-3 text-left transition-colors"
    >
      <div className="flex items-start gap-2.5">
        <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 mt-0.5">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-100/70 dark:bg-blue-900/50 px-1.5 py-0.5 rounded">
              Sponsor Tip
            </span>
            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              Active Recall doubles exam scores
            </span>
          </div>
          <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5">
            Testing yourself with StudyAI quizzes improves long-term memory retention by 50%.
          </p>
        </div>
      </div>

      <button
        id="btn-ad-remove"
        onClick={onUpgrade}
        className="shrink-0 text-[11px] font-medium text-blue-700 dark:text-blue-300 hover:underline flex items-center gap-1 px-2 py-1 rounded-lg bg-white/80 dark:bg-zinc-700/60 shadow-xs border border-blue-200/60 dark:border-zinc-600"
      >
        <Crown className="w-3 h-3 text-amber-500" />
        <span>Remove Ads</span>
      </button>
    </div>
  );
};
