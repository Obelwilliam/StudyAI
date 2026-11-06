import React, { useState } from "react";
import { Sparkles, Brain, FileCheck, Calendar, ArrowRight, Check } from "lucide-react";
import { EducationLevel } from "../types";

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (level: EducationLevel, subjects: string[]) => void;
}

const ALL_SUBJECTS = [
  "Mathematics",
  "Biology",
  "Physics",
  "Chemistry",
  "Computer Science",
  "World History",
  "Literature & English",
  "Economics",
  "Psychology",
  "Foreign Languages",
  "Medicine",
  "Law",
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState<EducationLevel>("High School");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([
    "Mathematics",
    "Biology",
  ]);

  if (!isOpen) return null;

  const slides = [
    {
      icon: Sparkles,
      color: "bg-blue-600 text-white",
      title: "Study smarter with AI.",
      subtitle:
        "Instant academic answers tailored to your level, with clear step-by-step breakdowns.",
    },
    {
      icon: Brain,
      color: "bg-purple-600 text-white",
      title: "Understand difficult topics.",
      subtitle:
        "Switch between simple analogies, detailed technical explanations, and real-world examples in a click.",
    },
    {
      icon: FileCheck,
      color: "bg-emerald-600 text-white",
      title: "Turn notes into quizzes and flashcards.",
      subtitle:
        "Scan handwritten pages or paste lecture notes to generate interactive practice quizzes and active-recall decks.",
    },
    {
      icon: Calendar,
      color: "bg-amber-600 text-white",
      title: "Build your personalized study plan.",
      subtitle:
        "Structured multi-week study roadmaps with milestone tracking so you enter exam day 100% confident.",
    },
  ];

  const toggleSubject = (subject: string) => {
    if (selectedSubjects.includes(subject)) {
      if (selectedSubjects.length > 1) {
        setSelectedSubjects(selectedSubjects.filter((s) => s !== subject));
      }
    } else {
      setSelectedSubjects([...selectedSubjects, subject]);
    }
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(selectedLevel, selectedSubjects);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div
        id="onboarding-modal"
        className="relative w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl text-left"
        role="dialog"
      >
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-1.5">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentStep
                    ? "w-6 bg-blue-600"
                    : i < currentStep
                    ? "w-2 bg-blue-300 dark:bg-blue-800"
                    : "w-2 bg-zinc-200 dark:bg-zinc-800"
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-zinc-400">
            Step {currentStep + 1} of 6
          </span>
        </div>

        {/* Slides 0 - 3 */}
        {currentStep < 4 && (
          <div className="py-4 text-center">
            {React.createElement(slides[currentStep].icon, {
              className: `w-14 h-14 p-3 rounded-2xl mx-auto mb-4 ${slides[currentStep].color} shadow-lg shadow-blue-500/10`,
            })}
            <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              {slides[currentStep].title}
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2.5 leading-relaxed max-w-xs mx-auto">
              {slides[currentStep].subtitle}
            </p>
          </div>
        )}

        {/* Step 4: Education Level */}
        {currentStep === 4 && (
          <div className="py-2">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              What level are you studying at?
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              AI adapts all explanations and quiz difficulties to your current stage.
            </p>

            <div className="grid grid-cols-2 gap-2.5 mt-5">
              {(
                [
                  { id: "Beginner", label: "Beginner" },
                  { id: "High School", label: "High School" },
                  { id: "University", label: "University" },
                  { id: "Advanced", label: "Advanced" },
                ] as const
              ).map((lvl) => (
                <button
                  key={lvl.id}
                  id={`onboard-level-${lvl.id.toLowerCase().replace(/\s+/g, "-")}`}
                  onClick={() => setSelectedLevel(lvl.id)}
                  className={`p-3.5 rounded-2xl border text-sm font-semibold transition-all text-left flex items-center justify-between ${
                    selectedLevel === lvl.id
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/30"
                      : "border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  <span>{lvl.label}</span>
                  {selectedLevel === lvl.id && <Check className="w-4 h-4 text-blue-600" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Main Subjects */}
        {currentStep === 5 && (
          <div className="py-2">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              What subjects do you study?
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Select one or more. You can change these anytime in your Profile.
            </p>

            <div className="grid grid-cols-2 gap-2 mt-4 max-h-56 overflow-y-auto pr-1">
              {ALL_SUBJECTS.map((subj) => {
                const isSelected = selectedSubjects.includes(subj);
                return (
                  <button
                    key={subj}
                    onClick={() => toggleSubject(subj)}
                    className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-colors flex items-center justify-between ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold"
                        : "border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300"
                    }`}
                  >
                    <span className="truncate">{subj}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-6 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          {currentStep > 0 ? (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          <button
            id="btn-onboarding-next"
            onClick={handleNext}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all"
          >
            <span>{currentStep === 5 ? "Get Started" : "Continue"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
