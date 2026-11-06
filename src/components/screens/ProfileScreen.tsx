import React, { useState } from "react";
import {
  User as UserIcon,
  Crown,
  HardDrive,
  Moon,
  Sun,
  Globe,
  Shield,
  FileText,
  Smartphone,
  Trash2,
  LogOut,
  ChevronRight,
  Sparkles,
  Award,
  Layers,
  Check,
  Edit2,
  Lock,
} from "lucide-react";
import { UserProfile, EducationLevel, PlanType } from "../../types";
import { ConfirmModal } from "../ConfirmModal";

interface ProfileScreenProps {
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onOpenUpgrade: () => void;
  onOpenDrive: () => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onOpenAppStore: () => void;
  onOpenAdmin: () => void;
  onSignOut: () => void;
  onDeleteAccount: () => void;
  hasDriveToken: boolean;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  profile,
  onUpdateProfile,
  onOpenUpgrade,
  onOpenDrive,
  onOpenPrivacy,
  onOpenTerms,
  onOpenAppStore,
  onOpenAdmin,
  onSignOut,
  onDeleteAccount,
  hasDriveToken,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalText, setGoalText] = useState(profile.learningGoals);

  const saveGoal = () => {
    onUpdateProfile({ learningGoals: goalText });
    setIsEditingGoal(false);
  };

  return (
    <div id="screen-profile" className="space-y-4 pb-6 text-left">
      {/* User Header Card */}
      <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-extrabold text-base flex items-center justify-center shadow-md shadow-blue-500/20">
            {profile.name ? profile.name.slice(0, 1).toUpperCase() : "S"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                {profile.name || "Student"}
              </h2>
              {profile.plan === "premium" ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-1">
                  <Crown className="w-2.5 h-2.5" /> PRO
                </span>
              ) : (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                  FREE
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {profile.email || "student@studyai.app"}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenUpgrade}
          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-colors"
        >
          {profile.plan === "premium" ? "Plan" : "Upgrade"}
        </button>
      </div>

      {/* Academic Preferences */}
      <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Academic Configuration
        </h3>

        {/* Education Level */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-zinc-900 dark:text-white">Education Level</p>
            <p className="text-[11px] text-zinc-500">Calibrates vocabulary and question depth</p>
          </div>
          <select
            value={profile.educationLevel}
            onChange={(e) => onUpdateProfile({ educationLevel: e.target.value as EducationLevel })}
            className="text-xs font-semibold py-1 px-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700"
          >
            <option value="Beginner">Beginner</option>
            <option value="High School">High School</option>
            <option value="University">University</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        {/* Learning Goal */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-zinc-900 dark:text-white">Learning Goal</span>
            {!isEditingGoal && (
              <button
                onClick={() => setIsEditingGoal(true)}
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" /> Edit
              </button>
            )}
          </div>
          {isEditingGoal ? (
            <div className="space-y-2 mt-2">
              <textarea
                rows={2}
                value={goalText}
                onChange={(e) => setGoalText(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsEditingGoal(false)}
                  className="px-2.5 py-1 text-xs text-zinc-500 hover:bg-zinc-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={saveGoal}
                  className="px-3 py-1 text-xs font-bold rounded-lg bg-blue-600 text-white"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {profile.learningGoals || "No goal specified yet."}
            </p>
          )}
        </div>
      </div>

      {/* Cloud & Integrations */}
      <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Cloud Integrations
        </h3>

        {/* Google Drive Status */}
        <button
          onClick={onOpenDrive}
          className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-900 dark:text-white">Google Drive</p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {hasDriveToken ? "Connected & Syncing" : "Not connected · Tap to link"}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-400" />
        </button>
      </div>

      {/* App Preferences */}
      <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Preferences & Language
        </h3>

        {/* Dark Mode */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              {profile.darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </div>
            <span className="text-xs font-semibold text-zinc-900 dark:text-white">Dark Mode</span>
          </div>
          <button
            id="toggle-dark-mode"
            onClick={() => onUpdateProfile({ darkMode: !profile.darkMode })}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              profile.darkMode ? "bg-blue-600" : "bg-zinc-300 dark:bg-zinc-700"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                profile.darkMode ? "right-1" : "left-1"
              }`}
            />
          </button>
        </div>

        {/* Language */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              <Globe className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-zinc-900 dark:text-white">Language</span>
          </div>
          <select
            value={profile.language}
            onChange={(e) => onUpdateProfile({ language: e.target.value })}
            className="text-xs font-semibold py-1 px-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700"
          >
            <option value="English">English</option>
            <option value="Spanish">Español</option>
            <option value="French">Français</option>
            <option value="German">Deutsch</option>
            <option value="Mandarin">中文</option>
            <option value="Arabic">العربية</option>
          </select>
        </div>
      </div>

      {/* Legal & App Store Metadata */}
      <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">About & Legal</h3>

        <button
          onClick={onOpenPrivacy}
          className="w-full flex items-center justify-between py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:text-blue-600"
        >
          <div className="flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-zinc-400" />
            <span>Privacy Policy</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
        </button>

        <button
          onClick={onOpenTerms}
          className="w-full flex items-center justify-between py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:text-blue-600"
        >
          <div className="flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-zinc-400" />
            <span>Terms of Service</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
        </button>

        <button
          onClick={onOpenAppStore}
          className="w-full flex items-center justify-between py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:text-blue-600"
        >
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-4 h-4 text-zinc-400" />
            <span>App Store Listing Description</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
        </button>

        <button
          onClick={onOpenAdmin}
          className="w-full flex items-center justify-between py-2 text-xs text-purple-600 dark:text-purple-400 font-semibold"
        >
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4" />
            <span>Administrator Control Dashboard</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Account Actions */}
      <div className="pt-2 flex items-center justify-between text-xs">
        <button
          onClick={onSignOut}
          className="px-4 py-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1.5 font-semibold"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>

        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="px-4 py-2 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-1.5 font-semibold"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete Account</span>
        </button>
      </div>

      {/* Confirm Account Deletion Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Account & Data?"
        message="This will permanently delete your StudyAI profile, study streak, and all local history records. This cannot be undone."
        confirmLabel="Delete Everything"
        cancelLabel="Keep Account"
        isDestructive={true}
        onConfirm={() => {
          setShowDeleteConfirm(false);
          onDeleteAccount();
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};
