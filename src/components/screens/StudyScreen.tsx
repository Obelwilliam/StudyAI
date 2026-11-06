import React from "react";
import {
  Sparkles,
  Camera,
  FileText,
  ListChecks,
  Layers,
  Calendar,
} from "lucide-react";
import { AskAIView } from "../study/AskAIView";
import { ScanNotesView } from "../study/ScanNotesView";
import { SummarizerView } from "../study/SummarizerView";
import { QuizView } from "../study/QuizView";
import { FlashcardsView } from "../study/FlashcardsView";
import { StudyPlanView } from "../study/StudyPlanView";
import { UserProfile } from "../../types";

export type StudyToolTab = "ask" | "scan" | "summarize" | "quiz" | "flashcards" | "plan";

interface StudyScreenProps {
  activeTool: StudyToolTab;
  onChangeTool: (tool: StudyToolTab) => void;
  profile: UserProfile;
  prefillPrompt?: string;
  onOpenUpgrade: () => void;
  onOpenDrivePicker: () => void;
}

export const StudyScreen: React.FC<StudyScreenProps> = ({
  activeTool,
  onChangeTool,
  profile,
  prefillPrompt = "",
  onOpenUpgrade,
  onOpenDrivePicker,
}) => {
  const tools = [
    { id: "ask" as const, label: "Ask AI", icon: Sparkles },
    { id: "scan" as const, label: "Scan Notes", icon: Camera },
    { id: "summarize" as const, label: "Summarize", icon: FileText },
    { id: "quiz" as const, label: "Quiz", icon: ListChecks },
    { id: "flashcards" as const, label: "Cards", icon: Layers },
    { id: "plan" as const, label: "Plan", icon: Calendar },
  ];

  return (
    <div id="screen-study" className="space-y-4 pb-6">
      {/* Tool Segmented Switcher */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 overflow-x-auto no-scrollbar">
        {tools.map((t) => {
          const Icon = t.icon;
          const isActive = activeTool === t.id;
          return (
            <button
              key={t.id}
              id={`tool-tab-${t.id}`}
              onClick={() => onChangeTool(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tool View */}
      {activeTool === "ask" && (
        <AskAIView
          initialEducationLevel={profile.educationLevel}
          userId={profile.id}
          isPremium={profile.plan === "premium"}
          onOpenUpgrade={onOpenUpgrade}
          onSendToQuiz={(text, title) => {
            onChangeTool("quiz");
          }}
          onSendToFlashcards={(text, title) => {
            onChangeTool("flashcards");
          }}
        />
      )}

      {activeTool === "scan" && (
        <ScanNotesView
          userId={profile.id}
          isPremium={profile.plan === "premium"}
          onOpenUpgrade={onOpenUpgrade}
          onSendToSummarize={(text, title) => {
            onChangeTool("summarize");
          }}
          onSendToQuiz={(text, title) => {
            onChangeTool("quiz");
          }}
          onSendToFlashcards={(text, title) => {
            onChangeTool("flashcards");
          }}
          onSendToAsk={(text) => {
            onChangeTool("ask");
          }}
        />
      )}

      {activeTool === "summarize" && (
        <SummarizerView
          initialText={prefillPrompt}
          userId={profile.id}
          isPremium={profile.plan === "premium"}
          onOpenUpgrade={onOpenUpgrade}
          onOpenDrivePicker={onOpenDrivePicker}
          onSendToQuiz={(text, title) => {
            onChangeTool("quiz");
          }}
          onSendToFlashcards={(text, title) => {
            onChangeTool("flashcards");
          }}
        />
      )}

      {activeTool === "quiz" && (
        <QuizView
          initialTopic={prefillPrompt}
          userId={profile.id}
          isPremium={profile.plan === "premium"}
          onOpenUpgrade={onOpenUpgrade}
          onOpenDrivePicker={onOpenDrivePicker}
        />
      )}

      {activeTool === "flashcards" && (
        <FlashcardsView
          initialTopic={prefillPrompt}
          userId={profile.id}
          isPremium={profile.plan === "premium"}
          onOpenUpgrade={onOpenUpgrade}
          onOpenDrivePicker={onOpenDrivePicker}
        />
      )}

      {activeTool === "plan" && (
        <StudyPlanView
          initialLevel={profile.educationLevel}
          initialSubjects={profile.mainSubjects}
          userId={profile.id}
          isPremium={profile.plan === "premium"}
          onOpenUpgrade={onOpenUpgrade}
        />
      )}
    </div>
  );
};
