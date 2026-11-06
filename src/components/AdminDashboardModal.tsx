import React, { useState, useEffect } from "react";
import {
  X,
  Lock,
  Activity,
  Users,
  Cpu,
  AlertTriangle,
  Zap,
  RotateCcw,
  Check,
  ShieldCheck,
} from "lucide-react";
import { fetchAdminStats, resetUsageLimits } from "../services/apiClient";
import { AdminStats, UserProfile } from "../types";

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onTogglePremium: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  profile,
  onTogglePremium,
}) => {
  const [pin, setPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const correctSecret = "studyai-admin";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim().toLowerCase() === correctSecret) {
      setIsAuthenticated(true);
      loadStats();
    } else {
      alert("Invalid secret key. Use 'studyai-admin'");
    }
  };

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAdminStats(correctSecret);
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetLimits = async () => {
    try {
      await resetUsageLimits(correctSecret);
      setResetMessage("All in-memory usage counters reset to 0.");
      loadStats();
      setTimeout(() => setResetMessage(null), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl text-left my-8">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                StudyAI Admin Control
              </h3>
              <p className="text-[11px] text-zinc-500">Live system telemetry & simulator</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isAuthenticated ? (
          <form onSubmit={handleLogin} className="py-6 space-y-3">
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Enter Administrator secret key to access backend monitoring metrics:
            </p>
            <div className="relative">
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Secret key (studyai-admin)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <Lock className="w-4 h-4 text-zinc-400 absolute right-3 top-3" />
            </div>
            <p className="text-[11px] text-zinc-400">
              Hint: use <strong>studyai-admin</strong>
            </p>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              Verify & Enter
            </button>
          </form>
        ) : (
          <div className="py-4 space-y-4">
            {/* Quick Testing Controls */}
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-850/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                Testing Simulator
              </span>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-zinc-900 dark:text-white">
                    Current Simulation Tier
                  </p>
                  <p className="text-[11px] text-zinc-500">Toggle between Free and Pro user limits</p>
                </div>
                <button
                  onClick={onTogglePremium}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    profile.plan === "premium"
                      ? "bg-amber-500 text-white"
                      : "bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200"
                  }`}
                >
                  {profile.plan === "premium" ? "Switch to Free" : "Upgrade to Pro"}
                </button>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <p className="text-xs font-semibold text-zinc-900 dark:text-white">
                  Reset Daily Rate Limits
                </p>
                <button
                  onClick={handleResetLimits}
                  className="px-2.5 py-1 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 text-xs text-zinc-700 dark:text-zinc-300 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>

              {resetMessage && (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  {resetMessage}
                </p>
              )}
            </div>

            {/* Metrics Grid */}
            {stats && (
              <div className="grid grid-cols-2 gap-2.5 text-left">
                <div className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                  <div className="flex items-center gap-1.5 text-zinc-500 text-xs mb-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>Active Users</span>
                  </div>
                  <div className="text-lg font-extrabold text-zinc-900 dark:text-white">
                    {stats.activeUsersToday}
                  </div>
                </div>

                <div className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                  <div className="flex items-center gap-1.5 text-zinc-500 text-xs mb-1">
                    <Activity className="w-3.5 h-3.5" />
                    <span>Total Requests</span>
                  </div>
                  <div className="text-lg font-extrabold text-blue-600 dark:text-blue-400">
                    {stats.totalAIRequests}
                  </div>
                </div>

                <div className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                  <div className="flex items-center gap-1.5 text-zinc-500 text-xs mb-1">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Est. AI Tokens</span>
                  </div>
                  <div className="text-lg font-extrabold text-purple-600 dark:text-purple-400">
                    {(stats.totalAIRequests * 380).toLocaleString()}
                  </div>
                </div>

                <div className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                  <div className="flex items-center gap-1.5 text-zinc-500 text-xs mb-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Error Count</span>
                  </div>
                  <div className="text-lg font-extrabold text-red-600">
                    {stats.errorsCount}
                  </div>
                </div>
              </div>
            )}

            {/* Feature breakdown */}
            {stats?.featureUsage && (
              <div className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-left">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                  Requests by Tool
                </span>
                <div className="space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                  {Object.entries(stats.featureUsage).map(([feat, count]) => (
                    <div key={feat} className="flex justify-between items-center py-0.5">
                      <span className="capitalize">{feat}</span>
                      <span className="font-bold text-zinc-900 dark:text-white">
                        {String(count)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}


            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold"
            >
              Close Console
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
