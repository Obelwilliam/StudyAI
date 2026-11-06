import React, { useState } from "react";
import {
  FileText,
  Sparkles,
  HardDrive,
  Copy,
  Check,
  Bookmark,
  Share2,
  ListChecks,
  Layers,
  Upload,
  BookMarked,
  AlertCircle,
  Download,
} from "lucide-react";
import { summarizeText, ApiError } from "../../services/apiClient";
import { saveHistoryItem } from "../../services/storageService";
import { saveFileToDrive } from "../../services/driveService";
import { SummaryResult } from "../../types";

interface SummarizerViewProps {
  initialText?: string;
  initialTitle?: string;
  userId: string;
  isPremium: boolean;
  onOpenUpgrade: () => void;
  onOpenDrivePicker: () => void;
  onSendToQuiz: (text: string, title: string) => void;
  onSendToFlashcards: (text: string, title: string) => void;
}

export const SummarizerView: React.FC<SummarizerViewProps> = ({
  initialText = "",
  initialTitle = "",
  userId,
  isPremium,
  onOpenUpgrade,
  onOpenDrivePicker,
  onSendToQuiz,
  onSendToFlashcards,
}) => {
  const [sourceText, setSourceText] = useState(initialText);
  const [length, setLength] = useState<"short" | "medium" | "detailed">("medium");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exportingDrive, setExportingDrive] = useState(false);
  const [driveExportNotice, setDriveExportNotice] = useState<string | null>(null);

  const handleSummarize = async () => {
    if (!sourceText.trim() || sourceText.trim().length < 10) {
      setError("Please enter or paste at least 10 characters to summarize.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setDriveExportNotice(null);

    try {
      const data = await summarizeText(sourceText, length, { userId, isPremium });
      const summaryResult: SummaryResult = {
        id: "sum_" + Date.now(),
        title: initialTitle || data.title || "Study Summary",
        sourceText,
        length,
        summary: data.summary,
        keyPoints: data.keyPoints || [],
        importantTerms: data.importantTerms || [],
        mainConcepts: data.mainConcepts || [],
        createdAt: new Date().toISOString(),
      };
      setResult(summaryResult);
    } catch (err: any) {
      if (err instanceof ApiError && err.isLimitError) {
        setError(err.message);
      } else {
        setError(err.message || "Failed to generate summary. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (!result) return;
    saveHistoryItem({
      type: "summary",
      title: result.title,
      preview: result.summary.slice(0, 120) + "...",
      data: result,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleCopy = () => {
    if (!result) return;
    const content = `# ${result.title}\n\n## Overview\n${result.summary}\n\n## Key Points\n${result.keyPoints.map((k) => `• ${k}`).join("\n")}\n\n## Important Vocabulary\n${result.importantTerms.map((t) => `• ${t.term}: ${t.definition}`).join("\n")}`;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportDrive = async () => {
    if (!result) return;
    setExportingDrive(true);
    setDriveExportNotice(null);
    try {
      const content = `STUDY SUMMARY: ${result.title}\nDate: ${new Date().toLocaleDateString()}\n\nOVERVIEW:\n${result.summary}\n\nKEY POINTS:\n${result.keyPoints.map((k, i) => `${i + 1}. ${k}`).join("\n")}\n\nVOCABULARY:\n${result.importantTerms.map((t) => `- ${t.term}: ${t.definition}`).join("\n")}\n\nExported from StudyAI`;
      await saveFileToDrive({
        filename: `${result.title.replace(/[^a-zA-Z0-9_-]/g, "_")}_Summary.txt`,
        content,
        mimeType: "text/plain",
      });
      setDriveExportNotice("Saved successfully to your Google Drive root folder!");
      setTimeout(() => setDriveExportNotice(null), 3500);
    } catch (err: any) {
      setError(err.message || "Failed to export to Google Drive. Please make sure Drive is connected.");
    } finally {
      setExportingDrive(false);
    }
  };

  const loadSampleNotes = () => {
    setSourceText(
      `Photosynthesis is a biological process used by plants, algae, and certain bacteria to synthesize organic compounds from carbon dioxide and water using light energy. The process is divided into two phases: the light-dependent reactions, which take place in the thylakoid membranes and produce ATP and NADPH while releasing oxygen gas via photolysis of water; and the light-independent reactions (Calvin cycle), which occur in the stroma of chloroplasts. In the Calvin cycle, the enzyme RuBisCO facilitates carbon fixation, incorporating atmospheric CO2 into 3-phosphoglycerate, which is subsequently reduced using ATP and NADPH into glyceraldehyde 3-phosphate (G3P), an essential precursor for glucose and starch.`
    );
  };

  return (
    <div id="summarizer-tool" className="space-y-4">
      {/* Input Configuration Card */}
      <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs text-left">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Smart Summarizer</h2>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Condense textbooks, lecture slides, and notes into high-yield summaries
              </p>
            </div>
          </div>

          <button
            onClick={onOpenDrivePicker}
            className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 flex items-center gap-1.5"
            title="Import from Google Drive"
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Drive</span>
          </button>
        </div>

        <textarea
          id="textarea-summarizer-input"
          rows={5}
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          placeholder="Paste textbook excerpt, lecture notes, or study guide here..."
          className="w-full p-3.5 text-xs sm:text-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed resize-none"
        />

        {/* Action Controls & Length Switcher */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
              Summary Depth:
            </span>
            <div className="inline-flex p-0.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs">
              {(
                [
                  { id: "short", label: "Short" },
                  { id: "medium", label: "Medium" },
                  { id: "detailed", label: "Detailed" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setLength(opt.id)}
                  className={`px-2.5 py-1 rounded-lg transition-colors text-xs ${
                    length === opt.id
                      ? "bg-white dark:bg-zinc-900 font-bold text-blue-600 dark:text-blue-400 shadow-xs"
                      : "text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!sourceText && (
              <button
                type="button"
                onClick={loadSampleNotes}
                className="text-[11px] text-zinc-500 hover:text-blue-600 underline"
              >
                Insert sample
              </button>
            )}

            <button
              id="btn-run-summarize"
              onClick={handleSummarize}
              disabled={isLoading || !sourceText.trim()}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isLoading ? "Summarizing..." : "Generate Summary"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-300 flex items-start justify-between gap-3 text-left">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Notice</p>
              <p className="mt-0.5">{error}</p>
            </div>
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
              onClick={handleSummarize}
              className="shrink-0 flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors"
            >
              <span>Retry</span>
            </button>
          )}
        </div>
      )}


      {driveExportNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{driveExportNotice}</span>
        </div>
      )}

      {/* Structured Output Result */}
      {result && !isLoading && (
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4 text-left">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-full">
                {result.length} Summary
              </span>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white mt-1">
                {result.title}
              </h3>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleCopy}
                className="p-2 rounded-xl text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 bg-zinc-100 dark:bg-zinc-800"
                title="Copy markdown summary"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={handleSave}
                className={`p-2 rounded-xl transition-colors ${
                  savedSuccess
                    ? "bg-emerald-100 text-emerald-700"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 bg-zinc-100 dark:bg-zinc-800"
                }`}
                title="Save summary"
              >
                <Bookmark className={`w-4 h-4 ${savedSuccess ? "fill-emerald-600" : ""}`} />
              </button>
              <button
                onClick={handleExportDrive}
                disabled={exportingDrive}
                className="p-2 rounded-xl text-emerald-600 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800"
                title="Save to Google Drive"
              >
                <Download className={`w-4 h-4 ${exportingDrive ? "animate-bounce" : ""}`} />
              </button>
            </div>
          </div>

          {/* Core Overview */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-850/60 border border-zinc-200/60 dark:border-zinc-800">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
              Executive Overview
            </span>
            <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">
              {result.summary}
            </p>
          </div>

          {/* Key Points */}
          {result.keyPoints?.length > 0 && (
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                Key Points
              </span>
              <ul className="space-y-1.5">
                {result.keyPoints.map((kp, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                    <span>{kp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Important Vocabulary / Terms */}
          {result.importantTerms?.length > 0 && (
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2 flex items-center gap-1.5">
                <BookMarked className="w-3.5 h-3.5 text-purple-500" />
                Important Terms & Definitions
              </span>
              <div className="grid sm:grid-cols-2 gap-2">
                {result.importantTerms.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 text-xs"
                  >
                    <span className="font-bold text-purple-900 dark:text-purple-200 block">
                      {item.term}
                    </span>
                    <span className="text-zinc-600 dark:text-zinc-400 mt-0.5 block leading-relaxed">
                      {item.definition}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center gap-2">
            <button
              onClick={() => onSendToQuiz(result.summary, `Quiz: ${result.title}`)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-100 border border-purple-200 dark:border-purple-800 flex items-center gap-1.5"
            >
              <ListChecks className="w-3.5 h-3.5" />
              <span>Turn into Practice Quiz</span>
            </button>
            <button
              onClick={() => onSendToFlashcards(result.summary, `Deck: ${result.title}`)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Turn into Flashcards</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
