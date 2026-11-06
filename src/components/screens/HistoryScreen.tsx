import React, { useState } from "react";
import {
  Clock,
  Search,
  Trash2,
  ExternalLink,
  Sparkles,
  FileText,
  ListChecks,
  Layers,
  Camera,
  Calendar,
  X,
  HardDrive,
  Copy,
  Check,
  AlertCircle,
} from "lucide-react";
import { HistoryItem, HistoryItemType } from "../../types";
import { ConfirmModal } from "../ConfirmModal";
import { saveFileToDrive } from "../../services/driveService";

interface HistoryScreenProps {
  history: HistoryItem[];
  onDeleteItem: (id: string) => void;
  onOpenItemInTool?: (item: HistoryItem) => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  history,
  onDeleteItem,
  onOpenItemInTool,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | HistoryItemType>("all");
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<HistoryItem | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const filters: Array<{ id: "all" | HistoryItemType; label: string }> = [
    { id: "all", label: "All" },
    { id: "question", label: "Questions" },
    { id: "summary", label: "Summaries" },
    { id: "quiz", label: "Quizzes" },
    { id: "flashcard", label: "Decks" },
    { id: "scan", label: "Notes" },
    { id: "plan", label: "Plans" },
  ];

  const filteredItems = history.filter((item) => {
    const matchesFilter = activeFilter === "all" || item.type === activeFilter;
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.preview.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getIcon = (type: HistoryItemType) => {
    switch (type) {
      case "question":
        return Sparkles;
      case "summary":
        return FileText;
      case "quiz":
        return ListChecks;
      case "flashcard":
        return Layers;
      case "scan":
        return Camera;
      case "plan":
        return Calendar;
      default:
        return FileText;
    }
  };

  const handleExportToDrive = async (item: HistoryItem) => {
    try {
      let content = `${item.title}\nSaved: ${new Date(item.createdAt).toLocaleString()}\n\n${JSON.stringify(item.data, null, 2)}`;
      if (item.type === "summary" && item.data) {
        content = `${item.title}\n\nSUMMARY:\n${item.data.summary}\n\nKEY POINTS:\n${(item.data.keyPoints || []).join("\n")}`;
      } else if (item.type === "question" && item.data) {
        content = `Q: ${item.data.question}\n\nEXPLANATION:\n${item.data.detailedExplanation}\n\nEXAMPLE:\n${item.data.example}`;
      }

      await saveFileToDrive({
        filename: `${item.title.replace(/[^a-zA-Z0-9_-]/g, "_")}.txt`,
        content,
      });

      setExportNotice(`Exported "${item.title}" to your Google Drive!`);
      setTimeout(() => setExportNotice(null), 3000);
    } catch (err: any) {
      setExportNotice(err.message || "Failed to export to Google Drive.");
      setTimeout(() => setExportNotice(null), 3000);
    }
  };

  return (
    <div id="screen-history" className="space-y-4 pb-6 text-left">
      {/* Search and Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">Study Library</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {history.length} saved questions, summaries, and quizzes
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search study history..."
          className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
        />
        <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              activeFilter === f.id
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {exportNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* History List */}
      {filteredItems.length === 0 ? (
        <div className="p-8 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center space-y-2">
          <Clock className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto" />
          <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            No study records found
          </p>
          <p className="text-[11px] text-zinc-400">
            Completed quizzes, questions, and summaries will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredItems.map((item) => {
            const Icon = getIcon(item.type);
            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-blue-500/60 dark:hover:border-blue-500/60 transition-all cursor-pointer shadow-xs flex items-center justify-between gap-3 group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 shrink-0 mt-0.5 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.2 rounded">
                        {item.type}
                      </span>
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                        {item.title}
                      </h4>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                      {item.preview}
                    </p>
                    <span className="text-[10px] text-zinc-400 block mt-1">
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExportToDrive(item);
                    }}
                    className="p-1.5 text-zinc-400 hover:text-emerald-600 rounded-lg transition-colors"
                    title="Export to Google Drive"
                  >
                    <HardDrive className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setItemToDelete(item);
                    }}
                    className="p-1.5 text-zinc-400 hover:text-red-600 rounded-lg transition-colors"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl text-left my-8 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-full">
                  {selectedItem.type}
                </span>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                  {selectedItem.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto py-4 space-y-3 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
              {selectedItem.type === "question" && selectedItem.data && (
                <div className="space-y-3">
                  <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
                    <p className="font-bold text-blue-900 dark:text-blue-200 mb-1">
                      Quick Summary
                    </p>
                    <p>{selectedItem.data.simpleExplanation}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-900 dark:text-white mb-1">
                      Detailed Explanation
                    </h4>
                    <p className="whitespace-pre-line">{selectedItem.data.detailedExplanation}</p>
                  </div>
                  {selectedItem.data.example && (
                    <div className="p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40">
                      <p className="font-bold text-amber-900 dark:text-amber-200 mb-1">Example</p>
                      <p>{selectedItem.data.example}</p>
                    </div>
                  )}
                </div>
              )}

              {selectedItem.type === "summary" && selectedItem.data && (
                <div className="space-y-3">
                  <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-850">
                    <p className="font-bold text-zinc-900 dark:text-white mb-1">Overview</p>
                    <p>{selectedItem.data.summary}</p>
                  </div>
                  {selectedItem.data.keyPoints?.length > 0 && (
                    <div>
                      <h4 className="font-bold text-zinc-900 dark:text-white mb-1.5">Key Points</h4>
                      <ul className="space-y-1">
                        {selectedItem.data.keyPoints.map((kp: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                            <span>{kp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {selectedItem.type === "quiz" && selectedItem.data && (
                <div className="space-y-3">
                  <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 font-bold flex items-center justify-between">
                    <span>Quiz Result</span>
                    <span>
                      {selectedItem.data.score} / {selectedItem.data.total} (
                      {selectedItem.data.percentage}%)
                    </span>
                  </div>
                  <div className="space-y-2">
                    {selectedItem.data.questions?.map((q: any, i: number) => (
                      <div key={i} className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <p className="font-bold">{i + 1}. {q.question}</p>
                        <p className="text-emerald-600 dark:text-emerald-400 mt-1">
                          Correct: {q.correctAnswer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedItem.type === "flashcard" && selectedItem.data && (
                <div className="space-y-2">
                  <p className="font-bold text-zinc-900 dark:text-white">
                    Cards in Deck ({selectedItem.data.cards?.length || 0})
                  </p>
                  {selectedItem.data.cards?.map((card: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <p className="font-semibold text-blue-600 dark:text-blue-400">[Front]: {card.front}</p>
                      <p className="mt-1 text-zinc-800 dark:text-zinc-200">[Back]: {card.back}</p>
                    </div>
                  ))}
                </div>
              )}

              {selectedItem.type === "scan" && selectedItem.data && (
                <div className="space-y-2">
                  <p className="font-mono bg-zinc-50 dark:bg-zinc-850 p-3 rounded-xl whitespace-pre-wrap">
                    {selectedItem.data.extractedText}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <button
                onClick={() => handleExportToDrive(selectedItem)}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold flex items-center gap-1.5"
              >
                <HardDrive className="w-3.5 h-3.5" />
                <span>Save to Drive</span>
              </button>

              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Item Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(itemToDelete)}
        title="Delete Study Record?"
        message={`Are you sure you want to delete "${itemToDelete?.title}" from your history?`}
        confirmLabel="Delete"
        cancelLabel="Keep"
        isDestructive={true}
        onConfirm={() => {
          if (itemToDelete) {
            onDeleteItem(itemToDelete.id);
            setItemToDelete(null);
          }
        }}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};
