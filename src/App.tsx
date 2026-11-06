import React, { useState, useEffect } from "react";
import { TopNav } from "./components/TopNav";
import { BottomNav, NavTab } from "./components/BottomNav";
import { HomeScreen } from "./components/screens/HomeScreen";
import { StudyScreen, StudyToolTab } from "./components/screens/StudyScreen";
import { HistoryScreen } from "./components/screens/HistoryScreen";
import { ProfileScreen } from "./components/screens/ProfileScreen";

import { AuthModal } from "./components/AuthModal";
import { DriveModal } from "./components/DriveModal";
import { UpgradeModal } from "./components/UpgradeModal";
import { OnboardingModal } from "./components/OnboardingModal";
import { PrivacyModal, TermsModal, AppStoreModal } from "./components/LegalModals";
import { AdminDashboardModal } from "./components/AdminDashboardModal";

import {
  getUserProfile,
  saveUserProfile,
  getHistoryItems,
  deleteHistoryItem,
  clearAllData,
} from "./services/storageService";
import {
  initAuthListener,
  signOutUser,
  getGoogleAccessToken,
} from "./services/firebase";
import { UserProfile, HistoryItem, PlanType, EducationLevel } from "./types";

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const [activeStudyTool, setActiveStudyTool] = useState<StudyToolTab>("ask");
  const [prefillPrompt, setPrefillPrompt] = useState<string>("");

  // Data & Profile
  const [profile, setProfile] = useState<UserProfile>(() => getUserProfile());
  const [history, setHistory] = useState<HistoryItem[]>(() => getHistoryItems());
  const [hasDriveToken, setHasDriveToken] = useState<boolean>(() => Boolean(getGoogleAccessToken()));

  // Modals
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(() => !profile.hasCompletedOnboarding);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showAppStoreModal, setShowAppStoreModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  // Sync dark mode class on document HTML
  useEffect(() => {
    if (profile.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [profile.darkMode]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = initAuthListener((user) => {
      if (user) {
        setProfile((prev) => {
          const updated = {
            ...prev,
            id: user.uid,
            name: user.displayName || prev.name,
            email: user.email || prev.email,
          };
          saveUserProfile(updated);
          return updated;
        });
        setHasDriveToken(Boolean(getGoogleAccessToken()));
      }
    });
    return () => unsubscribe();
  }, []);

  // Update profile helper
  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...updated };
      saveUserProfile(next);
      return next;
    });
  };

  // Switch to study tool with optional prefilled content
  const handleSelectTool = (toolId: StudyToolTab, prefill: string = "") => {
    setActiveStudyTool(toolId);
    setPrefillPrompt(prefill);
    setActiveTab("study");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Reload history items
  const reloadHistory = () => {
    setHistory(getHistoryItems());
  };

  const handleDeleteHistoryItem = (id: string) => {
    deleteHistoryItem(id);
    reloadHistory();
  };

  // Drive import handler: imports text from Drive into Summarizer or Quiz
  const handleDriveImport = (text: string, title: string) => {
    setPrefillPrompt(text);
    setActiveStudyTool("summarize");
    setActiveTab("study");
    setShowDriveModal(false);
  };

  // Sign out
  const handleSignOut = async () => {
    await signOutUser();
    setHasDriveToken(false);
    handleUpdateProfile({
      name: "Guest Student",
      email: "",
    });
  };

  // Delete account
  const handleDeleteAccount = () => {
    clearAllData();
    signOutUser();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      {/* Fixed Top Bar */}
      <TopNav
        profile={profile}
        onOpenUpgrade={() => setShowUpgradeModal(true)}
        onOpenDrive={() => setShowDriveModal(true)}
        onOpenProfile={() => setActiveTab("profile")}
        hasDriveToken={hasDriveToken}
      />

      {/* Main Container - Mobile first with centered layout on desktop */}
      <main className="flex-1 w-full max-w-xl mx-auto px-4 pt-4 pb-24">
        {activeTab === "home" && (
          <HomeScreen
            profile={profile}
            recentHistory={history}
            onSelectTool={handleSelectTool}
            onSelectHistoryItem={(item) => {
              setActiveTab("history");
            }}
            onOpenUpgrade={() => setShowUpgradeModal(true)}
          />
        )}

        {activeTab === "study" && (
          <StudyScreen
            activeTool={activeStudyTool}
            onChangeTool={(tool) => {
              setActiveStudyTool(tool);
            }}
            profile={profile}
            prefillPrompt={prefillPrompt}
            onOpenUpgrade={() => setShowUpgradeModal(true)}
            onOpenDrivePicker={() => setShowDriveModal(true)}
          />
        )}

        {activeTab === "history" && (
          <HistoryScreen
            history={history}
            onDeleteItem={handleDeleteHistoryItem}
          />
        )}

        {activeTab === "profile" && (
          <ProfileScreen
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onOpenUpgrade={() => setShowUpgradeModal(true)}
            onOpenDrive={() => setShowDriveModal(true)}
            onOpenPrivacy={() => setShowPrivacyModal(true)}
            onOpenTerms={() => setShowTermsModal(true)}
            onOpenAppStore={() => setShowAppStoreModal(true)}
            onOpenAdmin={() => setShowAdminModal(true)}
            onSignOut={handleSignOut}
            onDeleteAccount={handleDeleteAccount}
            hasDriveToken={hasDriveToken}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation Bar */}
      <BottomNav
        currentTab={activeTab}
        onChangeTab={(tab: NavTab) => {
          setActiveTab(tab);
          if (tab === "history") {
            reloadHistory();
          }
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

      {/* Modals & Dialogs */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={(userName: string, email: string) => {
          setHasDriveToken(Boolean(getGoogleAccessToken()));
          handleUpdateProfile({
            name: userName,
            email,
          });
        }}
      />

      <DriveModal
        isOpen={showDriveModal}
        onClose={() => setShowDriveModal(false)}
        onImportContent={handleDriveImport}
      />

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={profile.plan}
        onSelectPlan={(plan: PlanType) => {
          handleUpdateProfile({ plan });
          setShowUpgradeModal(false);
        }}
      />

      <OnboardingModal
        isOpen={showOnboardingModal}
        onComplete={(level: EducationLevel, subjects: string[]) => {
          handleUpdateProfile({
            educationLevel: level,
            mainSubjects: subjects,
            hasCompletedOnboarding: true,
          });
          setShowOnboardingModal(false);
        }}
      />

      <PrivacyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />

      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />

      <AppStoreModal
        isOpen={showAppStoreModal}
        onClose={() => setShowAppStoreModal(false)}
      />

      <AdminDashboardModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        profile={profile}
        onTogglePremium={() => {
          const newPlan = profile.plan === "premium" ? "free" : "premium";
          handleUpdateProfile({ plan: newPlan });
        }}
      />
    </div>
  );
}
