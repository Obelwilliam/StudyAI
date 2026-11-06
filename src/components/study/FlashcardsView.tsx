import React, { useState } from "react";
import {
  Layers,
  Sparkles,
  RotateCw,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Shuffle,
  HardDrive,
  Bookmark,
  Check,
  Plus,
  AlertCircle,
  Download,
} from "lucide-react";
import { generateFlashcards, ApiError } from "../../services/apiClient";
import { saveHistoryItem } from "../../services/storageService";
import { saveFileToDrive } from "../../services/driveService";
import { FlashcardDeck, FlashcardItem } from "../../types";

interface FlashcardsViewProps {
  initialTopic?: string;
  initialTitle?: string;
  initialDeck?: FlashcardDeck;
  userId: string;
  isPremium: boolean;
  onOpenUpgrade: () => void;
  onOpenDrivePicker: () => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  initialTopic = "",
  initialTitle = "",
  initialDeck,
  userId,
  isPremium,
  onOpenUpgrade,
  onOpenDrivePicker,
}) => {
  const [topic, setTopic] = useState(initialTopic);
  const [cardCount, setCardCount] = useState<number>(8);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active Deck
  const [activeDeck, setActiveDeck] = useState<FlashcardDeck | null>(initialDeck || null);
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [filterMode, setFilterMode] = useState<"all" | "difficult" | "learned">("all");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Please enter a subject, vocabulary list, or notes to generate flashcards.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsFlipped(false);
    setCurrentCardIdx(0);

    try {
      const data = await generateFlashcards(topic, cardCount, { userId, isPremium });
      if (!data.cards || !data.cards.length) {
        throw new Error("No flashcards could be generated from this topic.");
      }

      const deck: FlashcardDeck = {
        id: "deck_" + Date.now(),
        title: initialTitle || data.title || `Deck: ${topic.slice(0, 30)}`,
        subject: topic.slice(0, 20),
        cards: data.cards,
        createdAt: new Date().toISOString(),
      };

      setActiveDeck(deck);
      // Auto save
      saveHistoryItem({
        type: "flashcard",
        title: deck.title,
        preview: `${deck.cards.length} cards active-recall deck`,
        data: deck,
      });
    } catch (err: any) {
      if (err instanceof ApiError && err.isLimitError) {
        setError(err.message);
      } else {
        setError(err.message || "Failed to generate flashcards.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredCards = (): FlashcardItem[] => {
    if (!activeDeck) return [];
    if (filterMode === "difficult") return activeDeck.cards.filter((c) => c.isDifficult);
    if (filterMode === "learned") return activeDeck.cards.filter((c) => c.isLearned);
    return activeDeck.cards;
  };

  const filteredCards = getFilteredCards();
  const currentCard = filteredCards[currentCardIdx] || null;

  const toggleLearned = () => {
    if (!activeDeck || !currentCard) return;
    const updatedCards = activeDeck.cards.map((c) =>
      c.id === currentCard.id ? { ...c, isLearned: !c.isLearned, isDifficult: false } : c
    );
    setActiveDeck({ ...activeDeck, cards: updatedCards });
  };

  const toggleDifficult = () => {
    if (!activeDeck || !currentCard) return;
    const updatedCards = activeDeck.cards.map((c) =>
      c.id === currentCard.id ? { ...c, isDifficult: !c.isDifficult, isLearned: false } : c
    );
    setActiveDeck({ ...activeDeck, cards: updatedCards });
  };

  const handleShuffle = () => {
    if (!activeDeck) return;
    const shuffled = [...activeDeck.cards].sort(() => Math.random() - 0.5);
    setActiveDeck({ ...activeDeck, cards: shuffled });
    setCurrentCardIdx(0);
    setIsFlipped(false);
  };

  const handleExportDrive = async () => {
    if (!activeDeck) return;
    try {
      const content = `FLASHCARD DECK: ${activeDeck.title}\nTotal Cards: ${activeDeck.cards.length}\n\n` +
        activeDeck.cards
          .map((c, i) => `CARD ${i + 1}:\n[FRONT]: ${c.front}\n[BACK]: ${c.back}\n`)
          .join("\n---------------------------\n");

      await saveFileToDrive({
        filename: `${activeDeck.title.replace(/[^a-zA-Z0-9_-]/g, "_")}_Deck.txt`,
        content,
        mimeType: "text/plain",
      });
      setExportNotice("Saved deck to your Google Drive!");
      setTimeout(() => setExportNotice(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to export deck to Drive.");
    }
  };

  return (
    <div id="flashcards-tool" className="space-y-4 text-left">
      {/* Deck Creator */}
      {!activeDeck && (
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Flashcard Generator
                </h2>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Generate active-recall question & answer cards from any topic
                </p>
              </div>
            </div>

            <button
              onClick={onOpenDrivePicker}
              className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5"
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>Drive</span>
            </button>
          </div>

          <textarea
            id="textarea-flashcard-topic"
            rows={4}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter subject terms (e.g. 'Mitosis stages and cell division formulas') or paste notes..."
            className="w-full p-3.5 text-xs sm:text-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
          />

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                Cards:
              </span>
              <div className="inline-flex p-0.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs">
                {[6, 10, 15, 20].map((count) => (
                  <button
                    key={count}
                    onClick={() => {
                      if (count > 10 && !isPremium) onOpenUpgrade();
                      else setCardCount(count);
                    }}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                      cardCount === count
                        ? "bg-white dark:bg-zinc-900 text-emerald-600 shadow-xs"
                        : "text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            <button
              id="btn-generate-flashcards"
              onClick={handleGenerate}
              disabled={isLoading || !topic.trim()}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isLoading ? "Drafting Cards..." : "Create Deck"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-300 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Notice</p>
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

      {exportNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Active Deck Study View */}
      {activeDeck && (
        <div className="space-y-4">
          {/* Deck Header Bar */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                {activeDeck.title}
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {activeDeck.cards.filter((c) => c.isLearned).length} Learned ·{" "}
                {activeDeck.cards.filter((c) => c.isDifficult).length} Difficult
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleShuffle}
                className="p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                title="Shuffle deck"
              >
                <Shuffle className="w-4 h-4" />
              </button>
              <button
                onClick={handleExportDrive}
                className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60"
                title="Save deck to Google Drive"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveDeck(null)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline px-2"
              >
                New Deck
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs">
            <button
              onClick={() => {
                setFilterMode("all");
                setCurrentCardIdx(0);
                setIsFlipped(false);
              }}
              className={`flex-1 py-1 rounded-lg transition-colors font-semibold ${
                filterMode === "all"
                  ? "bg-white dark:bg-zinc-900 text-emerald-600 shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400"
              }`}
            >
              All ({activeDeck.cards.length})
            </button>
            <button
              onClick={() => {
                setFilterMode("difficult");
                setCurrentCardIdx(0);
                setIsFlipped(false);
              }}
              className={`flex-1 py-1 rounded-lg transition-colors font-semibold ${
                filterMode === "difficult"
                  ? "bg-white dark:bg-zinc-900 text-amber-600 shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400"
              }`}
            >
              Difficult ({activeDeck.cards.filter((c) => c.isDifficult).length})
            </button>
            <button
              onClick={() => {
                setFilterMode("learned");
                setCurrentCardIdx(0);
                setIsFlipped(false);
              }}
              className={`flex-1 py-1 rounded-lg transition-colors font-semibold ${
                filterMode === "learned"
                  ? "bg-white dark:bg-zinc-900 text-emerald-600 shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400"
              }`}
            >
              Learned ({activeDeck.cards.filter((c) => c.isLearned).length})
            </button>
          </div>

          {/* 3D Flip Flashcard */}
          {filteredCards.length === 0 ? (
            <div className="p-8 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500">
              No cards in this filter category.
            </div>
          ) : currentCard ? (
            <div className="space-y-3">
              {/* Progress counter */}
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span className="font-semibold">
                  Card {currentCardIdx + 1} of {filteredCards.length}
                </span>
                <span className="text-[11px] text-zinc-400">Tap card to flip</span>
              </div>

              {/* Card Container */}
              <div
                id="interactive-flashcard"
                onClick={() => setIsFlipped(!isFlipped)}
                className="relative w-full min-h-[220px] rounded-3xl p-6 border border-zinc-200 dark:border-zinc-750 bg-white dark:bg-zinc-850 shadow-md flex flex-col justify-between cursor-pointer transition-all hover:border-emerald-500 group select-none"
              >
                {/* Card Tag Top */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      isFlipped
                        ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                        : "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                    }`}
                  >
                    {isFlipped ? "Answer / Definition" : "Prompt / Question"}
                  </span>

                  <div className="flex items-center gap-1">
                    {currentCard.isDifficult && (
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-full">
                        Difficult
                      </span>
                    )}
                    {currentCard.isLearned && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                        Mastered
                      </span>
                    )}
                    <RotateCw className="w-3.5 h-3.5 text-zinc-400 group-hover:rotate-180 transition-transform duration-500" />
                  </div>
                </div>

                {/* Card Text Content */}
                <div className="my-auto py-4 text-center">
                  <p className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white leading-relaxed">
                    {isFlipped ? currentCard.back : currentCard.front}
                  </p>
                </div>

                <div className="text-center">
                  <span className="text-[11px] text-zinc-400">
                    {isFlipped ? "Tap to see question" : "Tap to reveal answer"}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Mark Difficult, Learned */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  id="btn-mark-difficult"
                  onClick={toggleDifficult}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    currentCard.isDifficult
                      ? "border-amber-500 bg-amber-500 text-white"
                      : "border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Difficult</span>
                </button>

                <button
                  id="btn-mark-learned"
                  onClick={toggleLearned}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    currentCard.isLearned
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Learned</span>
                </button>
              </div>

              {/* Prev / Next Navigation */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => {
                    setCurrentCardIdx(Math.max(0, currentCardIdx - 1));
                    setIsFlipped(false);
                  }}
                  disabled={currentCardIdx === 0}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <button
                  onClick={() => {
                    if (currentCardIdx < filteredCards.length - 1) {
                      setCurrentCardIdx(currentCardIdx + 1);
                      setIsFlipped(false);
                    }
                  }}
                  disabled={currentCardIdx >= filteredCards.length - 1}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-30 text-white flex items-center gap-1.5 shadow-xs"
                >
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
