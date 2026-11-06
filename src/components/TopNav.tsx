import React from "react";
import { Sparkles, Flame, WifiOff, HardDrive, ShieldCheck, Crown } from "lucide-react";
import { UserProfile } from "../types";

interface TopNavProps {
  profile: UserProfile;
  isOnline?: boolean;
  hasDriveToken: boolean;
  onOpenProfile: () => void;
  onOpenUpgrade: () => void;
  onOpenDrive?: () => void;
  onOpenLanding?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  profile,
  isOnline = true,
  hasDriveToken,
  onOpenProfile,
  onOpenUpgrade,
  onOpenDrive,
  onOpenLanding,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo and Brand */}
        <button
          id="btn-nav-brand"
          onClick={onOpenLanding || onOpenProfile}
          className="flex items-center gap-2 text-left focus:outline-none group"
          title="View StudyAI Overview"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/30 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-zinc-900 dark:text-white flex items-center gap-1.5">
              StudyAI
              {profile.plan === "premium" && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                  <Crown className="w-2.5 h-2.5 mr-0.5" /> PRO
                </span>
              )}
            </span>
          </div>
        </button>

        {/* Status Indicators & Controls */}
        <div className="flex items-center gap-2">
          {/* Offline Indicator */}
          {!isOnline && (
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-200 text-xs font-medium"
              title="You are currently offline. Saved study materials remain available."
            >
              <WifiOff className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Offline</span>
            </div>
          )}

          {/* Drive Connected Status button */}
          <button
            onClick={onOpenDrive}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
              hasDriveToken
                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700"
            }`}
            title="Google Drive Sync & File Storage"
          >
            <HardDrive className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[11px] font-semibold">Drive</span>
          </button>

          {/* Drive Connected Status */}
          {hasDriveToken && (
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-medium border border-emerald-200 dark:border-emerald-800"
              title="Google Drive connected for study note import and export"
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span className="text-[11px] hidden sm:inline">Drive Sync</span>
            </div>
          )}

          {/* Daily Study Streak */}
          <div
            id="streak-badge"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900/60 text-xs font-semibold"
            title={`Current Study Streak: ${profile.studyStreak} day${profile.studyStreak === 1 ? "" : "s"}`}
          >
            <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
            <span>{profile.studyStreak}d</span>
          </div>

          {/* Upgrade Button if Free */}
          {profile.plan === "free" && (
            <button
              id="btn-nav-upgrade"
              onClick={onOpenUpgrade}
              className="text-xs font-medium px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              Upgrade
            </button>
          )}

          {/* Profile Avatar */}
          <button
            id="btn-nav-profile"
            onClick={onOpenProfile}
            className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-700 dark:text-zinc-200 border-2 border-transparent hover:border-blue-500 focus:outline-none transition-colors"
            aria-label="User profile settings"
          >
            {profile.name ? profile.name.slice(0, 1).toUpperCase() : "U"}
          </button>
        </div>
      </div>
    </header>
  );
};
