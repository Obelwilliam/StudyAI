import React, { useState } from "react";
import {
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  Target,
  ArrowRight,
  BookOpen,
  Bookmark,
  Check,
  RotateCcw,
  ListTodo,
  AlertCircle,
} from "lucide-react";
import { generateStudyPlan, ApiError } from "../../services/apiClient";
import { saveHistoryItem } from "../../services/storageService";
import { EducationLevel, StudyPlan, StudyPlanActivity } from "../../types";

interface StudyPlanViewProps {
  initialLevel: EducationLevel;
  initialSubjects: string[];
  userId: string;
  isPremium: boolean;
  onOpenUpgrade: () => void;
}

export const StudyPlanView: React.FC<StudyPlanViewProps> = ({
  initialLevel,
  initialSubjects,
  userId,
  isPremium,
  onOpenUpgrade,
}) => {
  const [subject, setSubject] = useState(initialSubjects[0] || "Biology");
  const [level, setLevel] = useState<EducationLevel>(initialLevel);
  const [goal, setGoal] = useState("Score an A on the semester final exam");
  const [examDate, setExamDate] = useState("In 4 weeks");
  const [hoursPerDay, setHoursPerDay] = useState<number>(2);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active Plan
  const [activePlan, setActivePlan] = useState<StudyPlan | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !goal.trim()) {
      setError("Please specify both the subject and your target goal.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await generateStudyPlan(subject, level, goal, examDate, hoursPerDay, {
        userId,
        isPremium,
      });

      const plan: StudyPlan = {
        id: "plan_" + Date.now(),
        subject,
        currentLevel: level,
        goal,
        examDate,
        hoursPerDay,
        weeks: data.weeks || [],
        progress: 0,
        createdAt: new Date().toISOString(),
      };

      setActivePlan(plan);
      saveHistoryItem({
        type: "plan",
        title: `${subject} Study Roadmap`,
        preview: `Goal: ${goal} · ${hoursPerDay} hrs/day`,
        data: plan,
      });
    } catch (err: any) {
      if (err instanceof ApiError && err.isLimitError) {
        setError(err.message);
      } else {
        setError(err.message || "Unable to generate study plan at this time.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleActivity = (weekNum: number, activityId: string) => {
    if (!activePlan) return;

    let totalActivities = 0;
    let completedActivities = 0;

    const updatedWeeks = activePlan.weeks.map((w) => {
      const updatedActs = w.activities.map((act) => {
        const isTarget = act.id === activityId;
        const newCompleted = isTarget ? !act.isCompleted : act.isCompleted;
        totalActivities++;
        if (newCompleted) completedActivities++;
        return { ...act, isCompleted: newCompleted };
      });
      return { ...w, activities: updatedActs };
    });

    const progress = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;
    setActivePlan({ ...activePlan, weeks: updatedWeeks, progress });
  };

  const handleSave = () => {
    if (!activePlan) return;
    saveHistoryItem({
      type: "plan",
      title: `${activePlan.subject} Study Roadmap`,
      preview: `Goal: ${activePlan.goal} (${activePlan.progress}% completed)`,
      data: activePlan,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div id="study-plan-tool" className="space-y-4 text-left">
      {/* Wizard Configuration */}
      {!activePlan && (
        <form
          onSubmit={handleGenerate}
          className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3.5"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
                Personalized Study Roadmap
              </h2>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                AI designs a step-by-step syllabus tailored to your timeline
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                Subject
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Organic Chemistry"
                className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-850 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                Your Current Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as EducationLevel)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-850 text-zinc-900 dark:text-white focus:outline-none"
              >
                <option value="Beginner">Beginner</option>
                <option value="High School">High School</option>
                <option value="University">University</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
              Target Goal or Exam
            </label>
            <input
              type="text"
              required
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Master AP Calculus units 1-5 with an A grade"
              className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-850 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                Timeline / Exam Date
              </label>
              <input
                type="text"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                placeholder="e.g. In 3 weeks, or May 15"
                className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-850 text-zinc-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                Study Time / Day
              </label>
              <select
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-850 text-zinc-900 dark:text-white focus:outline-none"
              >
                <option value={1}>1 hour / day</option>
                <option value={2}>2 hours / day</option>
                <option value={3}>3 hours / day</option>
                <option value={4}>4+ hours / day</option>
              </select>
            </div>
          </div>

          <button
            id="btn-create-study-plan"
            type="submit"
            disabled={isLoading || !subject.trim()}
            className="w-full mt-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isLoading ? "Generating Curriculum..." : "Create My Study Roadmap"}</span>
          </button>
        </form>
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

      {/* Active Roadmap Display */}
      {activePlan && (
        <div className="space-y-4">
          {/* Header Card with Progress */}
          <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-full">
                  {activePlan.subject} Roadmap
                </span>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white mt-1">
                  {activePlan.goal}
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Target: {activePlan.examDate} · {activePlan.hoursPerDay} hrs/day
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={handleSave}
                  className={`p-2 rounded-xl transition-colors ${
                    savedSuccess
                      ? "bg-emerald-100 text-emerald-700"
                      : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 bg-zinc-100 dark:bg-zinc-800"
                  }`}
                  title="Save study plan"
                >
                  <Bookmark className={`w-4 h-4 ${savedSuccess ? "fill-emerald-600" : ""}`} />
                </button>
                <button
                  onClick={() => setActivePlan(null)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline px-2 font-medium"
                >
                  New Plan
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 mb-1.5 font-semibold">
                <span>Curriculum Progress</span>
                <span className="text-amber-600 dark:text-amber-400">{activePlan.progress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all duration-300"
                  style={{ width: `${activePlan.progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Weeks Breakdown */}
          <div className="space-y-3">
            {activePlan.weeks.map((week) => (
              <div
                key={week.weekNumber}
                className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-white bg-amber-500 w-6 h-6 rounded-lg flex items-center justify-center">
                      W{week.weekNumber}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
                      {week.theme}
                    </h4>
                  </div>
                </div>

                {/* Focus topics chips */}
                {week.focusTopics?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {week.focusTopics.map((topic, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                )}

                {/* Checklist Activities */}
                <div className="space-y-2">
                  {week.activities.map((act) => (
                    <button
                      key={act.id}
                      onClick={() => toggleActivity(week.weekNumber, act.id)}
                      className={`w-full p-2.5 rounded-xl border text-left flex items-start justify-between gap-2.5 transition-colors ${
                        act.isCompleted
                          ? "border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 text-zinc-400"
                          : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 bg-zinc-50/50 dark:bg-zinc-850/50"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                            act.isCompleted
                              ? "bg-emerald-600 border-emerald-600 text-white"
                              : "border-zinc-300 dark:border-zinc-600"
                          }`}
                        >
                          {act.isCompleted && <Check className="w-3 h-3" />}
                        </div>
                        <div>
                          <p
                            className={`text-xs font-semibold ${
                              act.isCompleted
                                ? "line-through text-zinc-400 dark:text-zinc-500"
                                : "text-zinc-900 dark:text-white"
                            }`}
                          >
                            {act.title}
                          </p>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                            {act.description}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] font-semibold text-zinc-400 shrink-0 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {act.durationMinutes}m
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
