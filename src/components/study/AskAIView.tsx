import React, { useState } from "react";
import {
  Sparkles,
  Send,
  BookOpen,
  HelpCircle,
  Bookmark,
  Check,
  Copy,
  ArrowRight,
  RotateCcw,
  ListChecks,
  Layers,
  Lightbulb,
} from "lucide-react";
import { AskAIResult, EducationLevel } from "../../types";
import { askAIQuestion, ApiError } from "../../services/apiClient";
import { saveHistoryItem } from "../../services/storageService";

interface AskAIViewProps {
  initialEducationLevel: EducationLevel;
  userId: string;
  isPremium: boolean;
  onOpenUpgrade: () => void;
  onSendToQuiz: (text: string, title: string) => void;
  onSendToFlashcards: (text: string, title: string) => void;
}

const EXAMPLE_PROMPTS = [
  "Explain cellular respiration step-by-step",
  "How does supply and demand set equilibrium price?",
  "What is the difference between mitosis and meiosis?",
  "Explain the Doppler Effect with a real-world example",
];

export const AskAIView: React.FC<AskAIViewProps> = ({
  initialEducationLevel,
  userId,
  isPremium,
  onOpenUpgrade,
  onSendToQuiz,
  onSendToFlashcards,
}) => {
  const [question, setQuestion] = useState("");
  const [level, setLevel] = useState<EducationLevel>(initialEducationLevel);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AskAIResult | null>(null);
  const [activeTab, setActiveTab] = useState<"standard" | "simple" | "detailed" | "example">("standard");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAsk = async (customQ?: string, mode: "default" | "simple" | "detailed" | "example" = "default") => {
    const query = customQ || question;
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setSavedSuccess(false);

    try {
      const data = await askAIQuestion(query, level, mode, { userId, isPremium });
      const fullResult: AskAIResult = {
        id: "q_" + Date.now(),
        question: query,
        educationLevel: level,
        simpleExplanation: data.simpleExplanation,
        detailedExplanation: data.detailedExplanation,
        importantPoints: data.importantPoints || [],
        example: data.example,
        relatedQuestions: data.relatedQuestions || [],
        createdAt: new Date().toISOString(),
      };
      setResult(fullResult);
      if (mode === "simple") setActiveTab("simple");
      else if (mode === "detailed") setActiveTab("detailed");
      else if (mode === "example") setActiveTab("example");
      else setActiveTab("standard");
    } catch (err: any) {
      if (err instanceof ApiError && err.isLimitError) {
        setError(err.message);
      } else {
        setError(err.message || "Could not fetch AI response. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (!result) return;
    saveHistoryItem({
      type: "question",
      title: result.question,
      preview: result.simpleExplanation.slice(0, 120) + "...",
      data: result,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `Question: ${result.question}\n\nSummary:\n${result.simpleExplanation}\n\nDetailed:\n${result.detailedExplanation}\n\nKey Points:\n${result.importantPoints.map((p) => "• " + p).join("\n")}\n\nExample:\n${result.example}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="ask-ai-tool" className="space-y-4">
      {/* Input Card */}
      <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Ask Academic AI</h2>
          </div>

          {/* Education Level Selector */}
          <select
            id="select-ask-level"
            value={level}
            onChange={(e) => setLevel(e.target.value as EducationLevel)}
            className="text-xs font-semibold py-1 px-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 focus:outline-none"
          >
            <option value="Beginner">Beginner</option>
            <option value="High School">High School</option>
            <option value="University">University</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="relative"
        >
          <textarea
            id="input-ask-question"
            rows={3}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type any homework or study question (e.g. 'Explain how enzymes catalyze chemical reactions')..."
            className="w-full p-3.5 pb-10 text-xs sm:text-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed"
          />

          <div className="absolute right-2.5 bottom-2.5 flex items-center gap-2">
            <button
              id="btn-submit-ask"
              type="submit"
              disabled={isLoading || !question.trim()}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
            >
              <span>{isLoading ? "Thinking..." : "Ask"}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* Quick prompt suggestions */}
        {!result && (
          <div className="mt-3">
            <span className="text-[11px] font-medium text-zinc-400 block mb-1.5">
              Popular questions:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {EXAMPLE_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuestion(p);
                    handleAsk(p);
                  }}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-zinc-600 dark:text-zinc-300 hover:text-blue-600 transition-colors text-left"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-300 flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold">Notice</p>
            <p className="mt-0.5">{error}</p>
          </div>
          {error.includes("limit") ? (
            <button
              onClick={onOpenUpgrade}
              className="shrink-0 px-3 py-1 text-xs font-bold rounded-xl bg-amber-500 text-white shadow-xs"
            >
              Upgrade
            </button>
          ) : (
            <button
              onClick={() => handleAsk()}
              className="shrink-0 flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          )}
        </div>
      )}


      {/* Loading Skeleton */}
      {isLoading && (
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-pulse space-y-3">
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md w-3/4" />
          <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded-md w-full" />
          <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded-md w-5/6" />
          <div className="h-20 bg-zinc-100 dark:bg-zinc-850 rounded-xl" />
        </div>
      )}

      {/* Structured Result Display */}
      {result && !isLoading && (
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4 text-left">
          {/* Header & Question */}
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-full">
                {result.educationLevel} Level
              </span>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white mt-1">
                {result.question}
              </h3>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                id="btn-copy-ask"
                onClick={handleCopy}
                className="p-2 rounded-xl text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 bg-zinc-100 dark:bg-zinc-800"
                title="Copy explanation"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                id="btn-save-ask"
                onClick={handleSave}
                className={`p-2 rounded-xl transition-colors ${
                  savedSuccess
                    ? "bg-emerald-100 text-emerald-700"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 bg-zinc-100 dark:bg-zinc-800"
                }`}
                title="Save to study history"
              >
                <Bookmark className={`w-4 h-4 ${savedSuccess ? "fill-emerald-600" : ""}`} />
              </button>
            </div>
          </div>

          {/* Quick Perspective Switcher */}
          <div className="flex gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-medium">
            <button
              onClick={() => setActiveTab("standard")}
              className={`flex-1 py-1.5 rounded-lg transition-colors ${
                activeTab === "standard"
                  ? "bg-white dark:bg-zinc-900 font-bold text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400"
              }`}
            >
              Full Study Guide
            </button>
            <button
              onClick={() => setActiveTab("simple")}
              className={`flex-1 py-1.5 rounded-lg transition-colors ${
                activeTab === "simple"
                  ? "bg-white dark:bg-zinc-900 font-bold text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400"
              }`}
            >
              Explain Simply
            </button>
            <button
              onClick={() => setActiveTab("detailed")}
              className={`flex-1 py-1.5 rounded-lg transition-colors ${
                activeTab === "detailed"
                  ? "bg-white dark:bg-zinc-900 font-bold text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400"
              }`}
            >
              In Detail
            </button>
            <button
              onClick={() => setActiveTab("example")}
              className={`flex-1 py-1.5 rounded-lg transition-colors ${
                activeTab === "example"
                  ? "bg-white dark:bg-zinc-900 font-bold text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400"
              }`}
            >
              Example
            </button>
          </div>

          {/* Tab 1: Standard Full View */}
          {activeTab === "standard" && (
            <div className="space-y-4">
              {/* Executive summary */}
              <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
                <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider block mb-1">
                  At a Glance
                </span>
                <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">
                  {result.simpleExplanation}
                </p>
              </div>

              {/* Detailed Breakdown */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Academic Breakdown
                </h4>
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                  {result.detailedExplanation}
                </p>
              </div>

              {/* Key points */}
              {result.importantPoints?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                    <ListChecks className="w-3.5 h-3.5 text-blue-500" />
                    Key Takeaways
                  </h4>
                  <ul className="space-y-2">
                    {result.importantPoints.map((pt, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Worked Example */}
              {result.example && (
                <div className="p-3.5 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40">
                  <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-1">
                    <Lightbulb className="w-3.5 h-3.5" />
                    Real-World Example
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">
                    {result.example}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Simple */}
          {activeTab === "simple" && (
            <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
              <h4 className="text-sm font-bold text-blue-900 dark:text-blue-100 mb-2">
                Simplified Analogy
              </h4>
              <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">
                {result.simpleExplanation}
              </p>
            </div>
          )}

          {/* Tab 3: Detailed */}
          {activeTab === "detailed" && (
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                Detailed Academic Explanation
              </h4>
              <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-line">
                {result.detailedExplanation}
              </p>
            </div>
          )}

          {/* Tab 4: Example */}
          {activeTab === "example" && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-100 mb-2 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                Concrete Application
              </h4>
              <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">
                {result.example}
              </p>
            </div>
          )}

          {/* Follow-up Test Questions */}
          {result.relatedQuestions?.length > 0 && (
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                Test Yourself Next:
              </span>
              <div className="space-y-1.5">
                {result.relatedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setQuestion(q);
                      handleAsk(q);
                    }}
                    className="w-full text-left p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-xs text-zinc-700 dark:text-zinc-300 hover:text-blue-600 transition-colors flex items-center justify-between"
                  >
                    <span>{q}</span>
                    <ArrowRight className="w-3 h-3 shrink-0 ml-2 text-zinc-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Bar: Convert to Quiz / Flashcards */}
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                const combined = `${result.question}\n\n${result.detailedExplanation}`;
                onSendToQuiz(combined, `Quiz: ${result.question.slice(0, 30)}...`);
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-100 border border-purple-200 dark:border-purple-800 flex items-center gap-1.5"
            >
              <ListChecks className="w-3.5 h-3.5" />
              <span>Create Practice Quiz</span>
            </button>
            <button
              onClick={() => {
                const combined = `${result.question}\n\n${result.detailedExplanation}`;
                onSendToFlashcards(combined, `Deck: ${result.question.slice(0, 30)}...`);
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Create Flashcards</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
