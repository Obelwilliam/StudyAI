import React, { useState } from "react";
import { X, Check, Crown, Zap, Sparkles, Shield, ArrowRight } from "lucide-react";
import { PlanType } from "../types";

interface UpgradeModalProps {
  isOpen: boolean;
  currentPlan: PlanType;
  onClose: () => void;
  onSelectPlan: (plan: PlanType) => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  currentPlan,
  onClose,
  onSelectPlan,
}) => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div
        id="upgrade-subscription-modal"
        className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl text-left my-8"
        role="dialog"
      >
        <button
          id="btn-close-upgrade"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center max-w-sm mx-auto mt-2">
          <div className="inline-flex p-3 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mb-3 shadow-xs">
            <Crown className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Elevate Your Learning with StudyAI Pro
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Unlimited AI questions, document scans, quizzes, and personalized study plans.
          </p>

          {/* Billing switcher */}
          <div className="mt-4 inline-flex p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-medium">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                billingCycle === "monthly"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs font-semibold"
                  : "text-zinc-600 dark:text-zinc-400"
              }`}
            >
              Monthly ($4.99/mo)
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                billingCycle === "yearly"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs font-semibold"
                  : "text-zinc-600 dark:text-zinc-400"
              }`}
            >
              Yearly ($3.33/mo <span className="text-emerald-600 font-bold">Save 33%</span>)
            </button>
          </div>
        </div>

        {/* Comparison Cards */}
        <div className="grid sm:grid-cols-2 gap-4 mt-6">
          {/* Free Plan */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              currentPlan === "free"
                ? "border-blue-500/60 bg-blue-50/30 dark:bg-blue-950/10 ring-2 ring-blue-500/20"
                : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40"
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Free Plan</h3>
              {currentPlan === "free" && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  Current
                </span>
              )}
            </div>
            <div className="mt-2 text-xl font-extrabold text-zinc-900 dark:text-zinc-100">$0</div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Essential study starter</p>

            <ul className="mt-4 space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>5 AI questions / day</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>2 handwritten note scans / day</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>2 quizzes / day (up to 5 questions)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Basic flashcards generator</span>
              </li>
              <li className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
                <X className="w-3.5 h-3.5 shrink-0" />
                <span>Educational sponsored tips shown</span>
              </li>
            </ul>

            <button
              id="btn-select-free-plan"
              onClick={() => {
                onSelectPlan("free");
                onClose();
              }}
              disabled={currentPlan === "free"}
              className={`w-full mt-5 py-2 text-xs font-semibold rounded-xl border transition-colors ${
                currentPlan === "free"
                  ? "border-zinc-300 dark:border-zinc-700 text-zinc-400 cursor-default"
                  : "border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
              }`}
            >
              {currentPlan === "free" ? "Active Plan" : "Switch to Free"}
            </button>
          </div>

          {/* Premium Plan */}
          <div
            className={`p-4 rounded-2xl border transition-all relative overflow-hidden ${
              currentPlan === "premium"
                ? "border-amber-500 bg-amber-50/20 dark:bg-amber-950/20 ring-2 ring-amber-500/30"
                : "border-amber-300/70 dark:border-amber-700/60 bg-gradient-to-b from-amber-50/40 to-orange-50/20 dark:from-zinc-850 dark:to-zinc-900"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Premium Pro</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white">
                POPULAR
              </span>
            </div>
            <div className="mt-2 text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {billingCycle === "yearly" ? "$39.99" : "$4.99"}
              <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">
                {billingCycle === "yearly" ? "/year" : "/month"}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Unrestricted mastery for serious students
            </p>

            <ul className="mt-4 space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="font-medium">Unlimited AI academic questions</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="font-medium">Unlimited note scans & OCR</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Quizzes up to 20 questions with hard mode</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Multi-week custom study plans</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>100% Ad-free experience</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Priority AI response speed</span>
              </li>
            </ul>

            <button
              id="btn-select-premium-plan"
              onClick={() => {
                onSelectPlan(currentPlan === "premium" ? "free" : "premium");
                onClose();
              }}
              className="w-full mt-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-1.5"
            >
              {currentPlan === "premium" ? "Downgrade to Free" : "Upgrade to Pro (Instant Preview)"}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Transparent Sandbox Disclaimer as mandated by Prompt Rule 20 */}
        <div className="mt-5 p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 text-[11px] text-zinc-600 dark:text-zinc-400 flex items-start gap-2">
          <Shield className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
          <p>
            <strong>Sandbox Development Notice:</strong> Payment gateway keys (Stripe/RevenueCat)
            are not live in this preview environment. Clicking upgrade instantly activates Pro
            features for testing without requiring real credit card billing.
          </p>
        </div>
      </div>
    </div>
  );
};
