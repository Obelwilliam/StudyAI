import React from "react";
import { X, ShieldCheck, FileText, Smartphone, Check } from "lucide-react";

export const PrivacyModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl text-left my-8 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">Privacy Policy</h2>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto py-4 space-y-4 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed pr-1">
          <p className="font-semibold text-zinc-800 dark:text-zinc-200">Last Updated: September 2026</p>
          <section>
            <h3 className="font-bold text-zinc-900 dark:text-white mb-1">1. Information We Collect</h3>
            <p>
              StudyAI collects study prompts, uploaded note images for optical character recognition,
              and educational profile preferences (e.g. grade level, target subjects) to personalize AI explanations.
            </p>
          </section>
          <section>
            <h3 className="font-bold text-zinc-900 dark:text-white mb-1">2. Note Scanning & Image Data</h3>
            <p>
              Images of handwritten notes and textbook pages are processed securely via encrypted channels
              strictly to transcribe text. Images are never sold to data brokers or used for third-party marketing.
            </p>
          </section>
          <section>
            <h3 className="font-bold text-zinc-900 dark:text-white mb-1">3. Google Drive Integration</h3>
            <p>
              When you connect Google Drive, StudyAI requests permission to read documents you select and save
              generated study guides or quizzes. We do not access, modify, or delete any files without your explicit action.
            </p>
          </section>
          <section>
            <h3 className="font-bold text-zinc-900 dark:text-white mb-1">4. Student Privacy & Data Deletion</h3>
            <p>
              You can delete your study history, account, or revoke Google Drive access at any time directly from the Profile tab.
            </p>
          </section>
        </div>
        <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
          <button onClick={onClose} className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900">
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};

export const TermsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl text-left my-8 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">Terms of Service</h2>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto py-4 space-y-4 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed pr-1">
          <section>
            <h3 className="font-bold text-zinc-900 dark:text-white mb-1">1. Educational Assistance</h3>
            <p>
              StudyAI is designed as an interactive learning tutor to help students grasp concepts, practice active recall,
              and structure study schedules. Users agree not to use the application to violate academic integrity policies.
            </p>
          </section>
          <section>
            <h3 className="font-bold text-zinc-900 dark:text-white mb-1">2. AI Tutoring Disclaimers</h3>
            <p>
              While our AI provides high-precision explanations aligned with educational standards, students are encouraged
              to corroborate critical test material with official textbooks and course syllabi.
            </p>
          </section>
          <section>
            <h3 className="font-bold text-zinc-900 dark:text-white mb-1">3. Fair Use & Rate Limits</h3>
            <p>
              Free accounts include daily quotas for AI queries and OCR processing. Automated scraping or misuse
              of server resources will lead to account restrictions.
            </p>
          </section>
        </div>
        <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
          <button onClick={onClose} className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export const AppStoreModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);
  if (!isOpen) return null;

  const metadataText = `App Name: StudyAI - AI Homework & Study Helper
Subtitle: Ask AI, Scan Notes, Quizzes & Flashcards
Category: Education / Productivity
Primary Language: English (Global)

Description:
Study smarter, not harder. StudyAI is the all-in-one AI learning companion built for high school, college, and university students.

KEY FEATURES:
• ASK AI TUTOR: Get instant, step-by-step academic explanations for difficult questions across STEM, humanities, and languages.
• SCAN HANDWRITTEN NOTES: Snap photos of class whiteboards, textbook pages, or handwritten notes with intelligent OCR.
• SMART SUMMARIZER: Transform 20-page lecture slides and readings into bullet points, key terms, and core concepts.
• INTERACTIVE QUIZZES: Practice active recall with customizable multiple-choice and true/false practice exams.
• 3D FLASHCARD DECKS: Master definitions and formulas with spaced-repetition flashcards.
• PERSONALIZED STUDY PLANS: Build milestone-driven multi-week roadmaps for midterm and final exam preparation.
• GOOGLE DRIVE SYNC: Directly import course files and export your flashcards and summaries.`;

  const copyMetadata = () => {
    navigator.clipboard.writeText(metadataText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl text-left my-8 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">
              App Store & Play Store Metadata
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto py-4">
          <pre className="text-xs bg-zinc-50 dark:bg-zinc-800/80 p-3.5 rounded-2xl font-mono text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed border border-zinc-200 dark:border-zinc-700">
            {metadataText}
          </pre>
        </div>
        <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <button
            onClick={copyMetadata}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : null}
            <span>{copied ? "Copied!" : "Copy Description"}</span>
          </button>
          <button onClick={onClose} className="px-4 py-1.5 text-xs font-medium rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
