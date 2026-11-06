import React, { useState, useRef } from "react";
import {
  Camera,
  Upload,
  Image as ImageIcon,
  Check,
  RotateCcw,
  Sparkles,
  FileText,
  HelpCircle,
  ListChecks,
  Layers,
  Bookmark,
  AlertCircle,
  Copy,
  Edit3,
} from "lucide-react";
import { scanNotesOCR, ApiError } from "../../services/apiClient";
import { saveHistoryItem } from "../../services/storageService";
import { ScannedNote } from "../../types";

interface ScanNotesViewProps {
  userId: string;
  isPremium: boolean;
  onOpenUpgrade: () => void;
  onSendToSummarize: (text: string, title: string) => void;
  onSendToQuiz: (text: string, title: string) => void;
  onSendToFlashcards: (text: string, title: string) => void;
  onSendToAsk: (text: string) => void;
}

export const ScanNotesView: React.FC<ScanNotesViewProps> = ({
  userId,
  isPremium,
  onOpenUpgrade,
  onSendToSummarize,
  onSendToQuiz,
  onSendToFlashcards,
  onSendToAsk,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("image/jpeg");
  const [extractedText, setExtractedText] = useState<string>("");
  const [noteTitle, setNoteTitle] = useState<string>("Lecture Notes");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compress and prepare image to base64
  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPEG, PNG, WebP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      setMimeType(file.type || "image/jpeg");
      setExtractedText("");
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Sample handwritten note generator for instant testing
  const loadSampleHandwrittenNote = () => {
    // Generate a lightweight canvas sample image of handwritten notes
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#fffdf7";
      ctx.fillRect(0, 0, 600, 400);

      // Draw faint notebook lines
      ctx.strokeStyle = "#e8eaed";
      ctx.lineWidth = 1;
      for (let y = 50; y < 400; y += 30) {
        ctx.beginPath();
        ctx.moveTo(30, y);
        ctx.lineTo(570, y);
        ctx.stroke();
      }

      // Draw handwritten simulated text
      ctx.fillStyle = "#1e3a8a";
      ctx.font = "bold 20px cursive, sans-serif";
      ctx.fillText("Biology 101 - Photosynthesis", 50, 42);

      ctx.fillStyle = "#1f2937";
      ctx.font = "16px cursive, sans-serif";
      ctx.fillText("1. Light-dependent reactions (Thylakoid):", 50, 80);
      ctx.fillText("   • Chlorophyll absorbs photons (wavelength 400-700nm)", 60, 110);
      ctx.fillText("   • Photolysis of H2O produces O2 + protons + electrons", 60, 140);
      ctx.fillText("   • ATP and NADPH are synthesized", 60, 170);
      ctx.fillText("2. Light-independent reactions (Calvin Cycle, Stroma):", 50, 200);
      ctx.fillText("   • Carbon fixation via enzyme RuBisCO", 60, 230);
      ctx.fillText("   • 3-PGA reduced to G3P sugar using ATP/NADPH", 60, 260);
      ctx.fillText("   • Overall: 6CO2 + 6H2O + Light → C6H12O6 + 6O2", 60, 290);
      ctx.fillText("Exam note: Remember RuBisCO is most abundant protein on Earth!", 50, 350);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      setImagePreview(dataUrl);
      setMimeType("image/jpeg");
      setExtractedText("");
      setError(null);
    }
  };

  const handleScan = async () => {
    if (!imagePreview) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await scanNotesOCR(imagePreview, mimeType, { userId, isPremium });
      if (!res.success) {
        setError(res.error || "Unable to read this image clearly. Try taking another photo with better lighting.");
      } else {
        setExtractedText(res.extractedText);
        setNoteTitle(res.titleSuggestion || "Scanned Notes");
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.isLimitError) {
        setError(err.message);
      } else {
        setError(err.message || "Unable to process OCR at this moment.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (!extractedText) return;
    const note: ScannedNote = {
      id: "scan_" + Date.now(),
      title: noteTitle,
      extractedText,
      imageUrl: imagePreview || undefined,
      createdAt: new Date().toISOString(),
    };
    saveHistoryItem({
      type: "scan",
      title: noteTitle,
      preview: extractedText.slice(0, 120) + "...",
      data: note,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="scan-notes-tool" className="space-y-4">
      <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Scan Notes (OCR)</h2>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Snap photos of whiteboard lectures, notebook pages, or book chapters
              </p>
            </div>
          </div>
        </div>

        {/* Upload / Capture Box */}
        {!imagePreview ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
            }}
            className="border-2 border-dashed border-zinc-200 dark:border-zinc-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-zinc-50/50 dark:bg-zinc-850/50"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-zinc-900 dark:text-white">
              Take photo or tap to browse files
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
              Supports JPEG, PNG, WebP up to 10MB
            </p>

            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  loadSampleHandwrittenNote();
                }}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Try Sample Handwritten Note</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-900 max-h-56 flex items-center justify-center">
              <img
                src={imagePreview}
                alt="Uploaded study note"
                className="max-h-56 object-contain"
              />
              <button
                onClick={() => {
                  setImagePreview(null);
                  setExtractedText("");
                }}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80"
                title="Remove image"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {!extractedText && (
              <button
                id="btn-perform-ocr"
                onClick={handleScan}
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isLoading ? "Transcribing with AI OCR..." : "Extract Text from Note"}</span>
              </button>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-300 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">OCR Notice</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
          {error.includes("limit") && (
            <button
              onClick={onOpenUpgrade}
              className="shrink-0 px-3 py-1 text-xs font-bold rounded-xl bg-amber-500 text-white shadow-xs"
            >
              Upgrade
            </button>
          )}
        </div>
      )}

      {/* Extracted Editable Note Area */}
      {extractedText && (
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3 text-left">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-purple-600" />
              <input
                type="text"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="text-xs font-bold bg-transparent text-zinc-900 dark:text-white border-b border-dashed border-zinc-300 dark:border-zinc-700 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 bg-zinc-100 dark:bg-zinc-800"
                title="Copy text"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={handleSave}
                className={`p-1.5 rounded-lg transition-colors ${
                  savedSuccess
                    ? "bg-emerald-100 text-emerald-700"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 bg-zinc-100 dark:bg-zinc-800"
                }`}
                title="Save note"
              >
                <Bookmark className={`w-3.5 h-3.5 ${savedSuccess ? "fill-emerald-600" : ""}`} />
              </button>
            </div>
          </div>

          <textarea
            id="textarea-extracted-ocr"
            rows={8}
            value={extractedText}
            onChange={(e) => setExtractedText(e.target.value)}
            className="w-full p-3 text-xs sm:text-sm rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-850 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed font-mono"
            placeholder="Extracted note text..."
          />

          <div className="pt-2">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
              Instant Actions with these notes:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                id="btn-note-summarize"
                onClick={() => onSendToSummarize(extractedText, noteTitle)}
                className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-left text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-blue-500" />
                <span>Summarize</span>
              </button>
              <button
                id="btn-note-explain"
                onClick={() => onSendToAsk(`Explain these study notes in clear detail:\n${extractedText}`)}
                className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-left text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                <span>Explain Topic</span>
              </button>
              <button
                id="btn-note-quiz"
                onClick={() => onSendToQuiz(extractedText, noteTitle)}
                className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-left text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 transition-colors"
              >
                <ListChecks className="w-3.5 h-3.5 text-purple-500" />
                <span>Generate Quiz</span>
              </button>
              <button
                id="btn-note-flashcards"
                onClick={() => onSendToFlashcards(extractedText, noteTitle)}
                className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-left text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 transition-colors"
              >
                <Layers className="w-3.5 h-3.5 text-emerald-500" />
                <span>Make Flashcards</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
