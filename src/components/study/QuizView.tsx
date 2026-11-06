import React, { useState } from "react";
import {
  ListChecks,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  PlusCircle,
  Trophy,
  ArrowRight,
  ArrowLeft,
  Bookmark,
  Check,
  HardDrive,
  AlertCircle,
} from "lucide-react";
import confetti from "canvas-confetti";
import { generateQuiz, ApiError } from "../../services/apiClient";
import { saveHistoryItem } from "../../services/storageService";
import { QuizQuestion, QuizResult } from "../../types";

interface QuizViewProps {
  initialTopic?: string;
  initialTitle?: string;
  userId: string;
  isPremium: boolean;
  onOpenUpgrade: () => void;
  onOpenDrivePicker: () => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  initialTopic = "",
  initialTitle = "",
  userId,
  isPremium,
  onOpenUpgrade,
  onOpenDrivePicker,
}) => {
  // Setup state
  const [topic, setTopic] = useState(initialTopic);
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [questionType, setQuestionType] = useState<"multiple_choice" | "true_false" | "mixed">("multiple_choice");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active quiz state
  const [activeQuiz, setActiveQuiz] = useState<QuizResult | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Please enter a subject, topic, or paste lecture notes to generate a quiz.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSelectedAnswers({});
    setCurrentIdx(0);
    setIsFinished(false);

    try {
      const data = await generateQuiz(topic, numQuestions, difficulty, questionType, {
        userId,
        isPremium,
      });

      if (!data.questions || !data.questions.length) {
        throw new Error("No quiz questions could be generated from this topic.");
      }

      const quiz: QuizResult = {
        id: "quiz_" + Date.now(),
        title: initialTitle || data.title || `Quiz: ${topic.slice(0, 30)}`,
        subject: topic.slice(0, 25),
        questions: data.questions,
        userAnswers: {},
        score: 0,
        total: data.questions.length,
        percentage: 0,
        createdAt: new Date().toISOString(),
      };
      setActiveQuiz(quiz);
    } catch (err: any) {
      if (err instanceof ApiError && err.isLimitError) {
        setError(err.message);
      } else {
        setError(err.message || "Unable to generate quiz at this time.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (questionId: string, option: string) => {
    if (isFinished) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleFinishQuiz = () => {
    if (!activeQuiz) return;

    let score = 0;
    activeQuiz.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        score++;
      }
    });

    const percentage = Math.round((score / activeQuiz.questions.length) * 100);

    const finalized: QuizResult = {
      ...activeQuiz,
      userAnswers: selectedAnswers,
      score,
      total: activeQuiz.questions.length,
      percentage,
    };

    setActiveQuiz(finalized);
    setIsFinished(true);

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // safe fallback
    }

    // Auto save to history
    saveHistoryItem({
      type: "quiz",
      title: finalized.title,
      preview: `Score: ${score}/${finalized.total} (${percentage}%)`,
      data: finalized,
    });
  };

  const handleManualSave = () => {
    if (!activeQuiz) return;
    saveHistoryItem({
      type: "quiz",
      title: activeQuiz.title,
      preview: `Score: ${activeQuiz.score}/${activeQuiz.total} (${activeQuiz.percentage}%)`,
      data: activeQuiz,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setCurrentIdx(0);
    setIsFinished(false);
  };

  return (
    <div id="quiz-generator-tool" className="space-y-4 text-left">
      {/* Quiz Creator Generator Mode */}
      {!activeQuiz && (
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                <ListChecks className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Active Recall Quiz Generator
                </h2>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Self-test any chapter, topic, or lecture notes
                </p>
              </div>
            </div>

            <button
              onClick={onOpenDrivePicker}
              className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5"
              title="Import from Google Drive"
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>Drive</span>
            </button>
          </div>

          <textarea
            id="textarea-quiz-topic"
            rows={4}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter topic (e.g. 'French Revolution Causes') or paste study notes..."
            className="w-full p-3.5 text-xs sm:text-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          />

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
            {/* Number of questions */}
            <div>
              <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
                Questions
              </label>
              <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs">
                {[5, 10, 15, 20].map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      if (num > 10 && !isPremium) {
                        onOpenUpgrade();
                      } else {
                        setNumQuestions(num);
                      }
                    }}
                    className={`py-1 rounded-lg transition-colors font-semibold ${
                      numQuestions === num
                        ? "bg-white dark:bg-zinc-900 text-purple-600 shadow-xs"
                        : "text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
                Difficulty
              </label>
              <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs">
                {(["easy", "medium", "hard"] as const).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`py-1 rounded-lg capitalize transition-colors font-semibold ${
                      difficulty === diff
                        ? "bg-white dark:bg-zinc-900 text-purple-600 shadow-xs"
                        : "text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Type */}
            <div>
              <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
                Type
              </label>
              <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs">
                {(
                  [
                    { id: "multiple_choice", label: "MCQ" },
                    { id: "true_false", label: "T/F" },
                    { id: "mixed", label: "Mixed" },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setQuestionType(t.id)}
                    className={`py-1 rounded-lg transition-colors font-semibold ${
                      questionType === t.id
                        ? "bg-white dark:bg-zinc-900 text-purple-600 shadow-xs"
                        : "text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            id="btn-generate-quiz"
            onClick={handleGenerate}
            disabled={isLoading || !topic.trim()}
            className="w-full mt-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-purple-500/20 flex items-center justify-center gap-1.5 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isLoading ? "Drafting Curriculum Quiz..." : "Generate Practice Quiz"}</span>
          </button>
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
          {error.includes("limit") ? (
            <button
              onClick={onOpenUpgrade}
              className="shrink-0 px-3 py-1 text-xs font-bold rounded-xl bg-amber-500 text-white shadow-xs"
            >
              Upgrade
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              className="shrink-0 flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors"
            >
              <span>Retry</span>
            </button>
          )}
        </div>
      )}

      {/* Active Quiz Runner: 1 Question at a time */}
      {activeQuiz && !isFinished && (
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          {/* Header & Progress */}
          <div>
            <div className="flex items-center justify-between text-xs text-zinc-500 mb-1.5">
              <span className="font-bold text-purple-600 dark:text-purple-400">
                Question {currentIdx + 1} of {activeQuiz.questions.length}
              </span>
              <span>
                {Math.round(((currentIdx + 1) / activeQuiz.questions.length) * 100)}% Complete
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-purple-600 transition-all duration-300"
                style={{
                  width: `${((currentIdx + 1) / activeQuiz.questions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="py-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
              {activeQuiz.questions[currentIdx].type === "multiple_choice"
                ? "Multiple Choice"
                : "True or False"}
            </span>
            <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white leading-relaxed">
              {activeQuiz.questions[currentIdx].question}
            </h3>
          </div>

          {/* Options */}
          <div className="space-y-2">
            {activeQuiz.questions[currentIdx].options.map((option, idx) => {
              const questionId = activeQuiz.questions[currentIdx].id;
              const isSelected = selectedAnswers[questionId] === option;
              return (
                <button
                  key={idx}
                  id={`quiz-opt-${idx}`}
                  onClick={() => handleSelectOption(questionId, option)}
                  className={`w-full p-3.5 rounded-2xl border text-xs sm:text-sm font-medium text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? "border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 ring-2 ring-purple-500/30"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-850"
                  }`}
                >
                  <span>{option}</span>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ml-3 ${
                      isSelected
                        ? "border-purple-600 bg-purple-600 text-white"
                        : "border-zinc-300 dark:border-zinc-600"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quiz Navigation Buttons */}
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <button
              onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
              disabled={currentIdx === 0}
              className="px-3 py-2 text-xs font-semibold rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            {currentIdx < activeQuiz.questions.length - 1 ? (
              <button
                id="btn-quiz-next"
                onClick={() => setCurrentIdx(currentIdx + 1)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1.5 shadow-xs"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                id="btn-quiz-submit"
                onClick={handleFinishQuiz}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white flex items-center gap-1.5 shadow-md shadow-purple-500/20"
              >
                <span>Submit Quiz</span>
                <Trophy className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Quiz Finished: Score Screen & Educational Review */}
      {activeQuiz && isFinished && (
        <div className="space-y-4">
          {/* Score Header Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-purple-50/70 to-white dark:from-purple-950/30 dark:to-zinc-900 border border-purple-100 dark:border-purple-900/40 text-center shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300 flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white">
              {activeQuiz.percentage >= 80
                ? "Outstanding Mastery! 🌟"
                : activeQuiz.percentage >= 60
                ? "Great Effort! Keep Going 💪"
                : "Good Practice! Review Below 📚"}
            </h3>
            <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 mt-2">
              {activeQuiz.score} / {activeQuiz.total}
              <span className="text-sm font-normal text-zinc-500 ml-2">
                ({activeQuiz.percentage}%)
              </span>
            </div>

            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                onClick={handleRetry}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
              <button
                onClick={() => setActiveQuiz(null)}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>New Quiz</span>
              </button>
            </div>
          </div>

          {/* Educational Review of each question */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 px-1">
              Detailed Answer Review
            </h4>

            {activeQuiz.questions.map((q, idx) => {
              const userAns = activeQuiz.userAnswers[q.id];
              const isCorrect = userAns === q.correctAnswer;

              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-2xl border text-xs sm:text-sm ${
                    isCorrect
                      ? "border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20"
                      : "border-red-200 dark:border-red-900/60 bg-red-50/30 dark:bg-red-950/20"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 shrink-0">
                      {isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-zinc-900 dark:text-white">
                        {idx + 1}. {q.question}
                      </p>

                      <div className="mt-2 space-y-1 text-xs">
                        <p className={isCorrect ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-300"}>
                          <strong>Your answer:</strong> {userAns || "(No answer selected)"}
                        </p>
                        {!isCorrect && (
                          <p className="text-emerald-700 dark:text-emerald-300">
                            <strong>Correct answer:</strong> {q.correctAnswer}
                          </p>
                        )}
                      </div>

                      {/* Educational explanation */}
                      {q.explanation && (
                        <div className="mt-2.5 p-2.5 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                          <span className="font-bold text-purple-600 dark:text-purple-400 block mb-0.5">
                            Why:
                          </span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
