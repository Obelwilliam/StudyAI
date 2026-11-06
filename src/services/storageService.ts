import { HistoryItem, HistoryItemType, UserProfile, PlanType } from "../types";

const HISTORY_KEY = "studyai_history_v1";
const PROFILE_KEY = "studyai_profile_v1";
const ONBOARDING_KEY = "studyai_onboarding_completed_v1";

const defaultProfile: UserProfile = {
  id: "student_" + Math.random().toString(36).substring(2, 9),
  name: "Alex",
  email: "alex.student@example.com",
  educationLevel: "High School",
  mainSubjects: ["Biology", "Mathematics", "World History"],
  learningGoals: "Prepare for upcoming semester finals and master core biology concepts.",
  plan: "free",
  studyStreak: 3,
  lastStudyDate: new Date().toISOString().slice(0, 10),
  completedTasksToday: 4,
  darkMode: false,
  language: "English",
  notificationsEnabled: true,
  createdAt: new Date().toISOString(),
};

const starterHistory: HistoryItem[] = [
  {
    id: "hist_sample_1",
    type: "question",
    title: "How does Cellular Respiration work?",
    preview: "Cellular respiration is the metabolic process that converts glucose into ATP energy...",
    createdAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    data: {
      id: "sample_q1",
      question: "How does Cellular Respiration work?",
      educationLevel: "High School",
      simpleExplanation:
        "Cellular respiration is how cells turn the food we eat (glucose) into usable chemical energy called ATP, using oxygen and releasing carbon dioxide and water.",
      detailedExplanation:
        "Cellular respiration occurs in three main biochemical stages: Glycolysis in the cytoplasm (anaerobic breakdown of glucose to pyruvate), the Krebs Cycle (Citric Acid Cycle) in the mitochondrial matrix, and Oxidative Phosphorylation via the electron transport chain across the inner mitochondrial membrane, producing roughly 30-32 ATP molecules per glucose molecule.",
      importantPoints: [
        "Equation: C6H12O6 + 6O2 → 6CO2 + 6H2O + ATP",
        "Glycolysis takes place in the cytoplasm and yields 2 net ATP",
        "The Krebs cycle produces NADH and FADH2 electron carriers",
        "The electron transport chain produces the vast majority of ATP via ATP synthase",
      ],
      example:
        "When running a marathon, muscle cells consume oxygen rapidly to produce ATP. If oxygen supply is insufficient, cells shift temporarily to lactic acid fermentation.",
      relatedQuestions: [
        "What is the net ATP yield from one glucose molecule?",
        "How does anaerobic fermentation differ from aerobic respiration?",
        "Why is oxygen referred to as the terminal electron acceptor?",
      ],
      createdAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    },
  },
  {
    id: "hist_sample_2",
    type: "flashcard",
    title: "Cell Biology Core Terms (8 Cards)",
    preview: "Mitochondria, Ribosome, Cell Membrane, Endoplasmic Reticulum...",
    createdAt: new Date(Date.now() - 3600 * 1000 * 18).toISOString(),
    data: {
      id: "deck_bio_1",
      title: "Cell Biology Core Terms",
      subject: "Biology",
      createdAt: new Date(Date.now() - 3600 * 1000 * 18).toISOString(),
      cards: [
        {
          id: "c1",
          front: "Mitochondria",
          back: "The powerhouse of eukaryotic cells; site of ATP synthesis through oxidative phosphorylation.",
          isLearned: true,
          isDifficult: false,
        },
        {
          id: "c2",
          front: "Ribosome",
          back: "Molecular complex composed of ribosomal RNA and protein that synthesizes proteins by translating mRNA.",
          isLearned: true,
          isDifficult: false,
        },
        {
          id: "c3",
          front: "Cell Membrane (Phospholipid Bilayer)",
          back: "Selectively permeable barrier with hydrophilic phosphate heads and hydrophobic fatty acid tails regulating molecule transport.",
          isLearned: false,
          isDifficult: true,
        },
        {
          id: "c4",
          front: "Endoplasmic Reticulum (Rough vs Smooth)",
          back: "Rough ER has ribosomes for protein folding/transport; Smooth ER synthesizes lipids, metabolizes carbs, and detoxifies chemicals.",
          isLearned: false,
          isDifficult: false,
        },
        {
          id: "c5",
          front: "Golgi Apparatus",
          back: "Series of flattened membranous sacs that modify, sort, and package proteins and lipids for vesicle secretion.",
          isLearned: false,
          isDifficult: false,
        },
      ],
    },
  },
  {
    id: "hist_sample_3",
    type: "quiz",
    title: "Newton's Laws of Motion Quiz",
    preview: "Score: 4/5 (80%) - Mechanics & Kinematics fundamentals",
    createdAt: new Date(Date.now() - 3600 * 1000 * 30).toISOString(),
    data: {
      id: "quiz_newton_1",
      title: "Newton's Laws of Motion Quiz",
      subject: "Physics",
      score: 4,
      total: 5,
      percentage: 80,
      createdAt: new Date(Date.now() - 3600 * 1000 * 30).toISOString(),
      questions: [
        {
          id: "nq1",
          question: "What does Newton's First Law of Motion state?",
          type: "multiple_choice",
          options: [
            "Force equals mass times acceleration",
            "An object remains at rest or in uniform motion unless acted upon by a net external force",
            "For every action there is an equal and opposite reaction",
            "Energy cannot be created or destroyed",
          ],
          correctAnswer:
            "An object remains at rest or in uniform motion unless acted upon by a net external force",
          explanation:
            "Newton's First Law is also known as the Law of Inertia: objects resist changes to their velocity without an external net force.",
        },
        {
          id: "nq2",
          question: "If mass is doubled while net force remains constant, what happens to acceleration?",
          type: "multiple_choice",
          options: ["It doubles", "It quadruples", "It is halved", "It remains unchanged"],
          correctAnswer: "It is halved",
          explanation:
            "According to F = ma, a = F/m. Therefore, acceleration is inversely proportional to mass.",
        },
        {
          id: "nq3",
          question: "Action and reaction forces cancel each other out on a single object.",
          type: "true_false",
          options: ["True", "False"],
          correctAnswer: "False",
          explanation:
            "Action and reaction forces act on two DIFFERENT objects, so they never cancel each other out on the same object.",
        },
        {
          id: "nq4",
          question: "What is the SI unit of force?",
          type: "multiple_choice",
          options: ["Joule", "Pascal", "Newton (kg·m/s²)", "Watt"],
          correctAnswer: "Newton (kg·m/s²)",
          explanation: "1 Newton is the force needed to accelerate 1 kg of mass at 1 m/s².",
        },
        {
          id: "nq5",
          question: "In the absence of gravity or friction, a launched projectile will eventually stop on its own.",
          type: "true_false",
          options: ["True", "False"],
          correctAnswer: "False",
          explanation:
            "Without external forces such as gravity or friction, an object in motion will continue in a straight line forever.",
        },
      ],
      userAnswers: {
        nq1: "An object remains at rest or in uniform motion unless acted upon by a net external force",
        nq2: "It is halved",
        nq3: "True", // answered wrong
        nq4: "Newton (kg·m/s²)",
        nq5: "False",
      },
    },
  },
];

export function getProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(defaultProfile));
      return defaultProfile;
    }
    return { ...defaultProfile, ...JSON.parse(raw) };
  } catch (e) {
    return defaultProfile;
  }
}

export function saveProfile(profile: Partial<UserProfile>): UserProfile {
  const current = getProfile();
  const updated = { ...current, ...profile };
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save profile", e);
  }
  return updated;
}

export function recordStudyActivity(): void {
  const profile = getProfile();
  const today = new Date().toISOString().slice(0, 10);
  const lastDate = profile.lastStudyDate;

  let newStreak = profile.studyStreak;
  if (lastDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (lastDate === yesterday) {
      newStreak += 1;
    } else if (lastDate < yesterday) {
      newStreak = 1;
    }
    saveProfile({
      studyStreak: newStreak,
      lastStudyDate: today,
      completedTasksToday: 1,
    });
  } else {
    saveProfile({
      completedTasksToday: (profile.completedTasksToday || 0) + 1,
    });
  }
}

export function getHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(starterHistory));
      return starterHistory;
    }
    return JSON.parse(raw);
  } catch (e) {
    return starterHistory;
  }
}

export function saveHistoryItem(item: Omit<HistoryItem, "id" | "createdAt">): HistoryItem {
  const newItem: HistoryItem = {
    ...item,
    id: "hist_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
    createdAt: new Date().toISOString(),
  };

  const current = getHistory();
  const updated = [newItem, ...current];
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save history", e);
  }
  recordStudyActivity();
  return newItem;
}

export function deleteHistoryItem(id: string): void {
  const current = getHistory();
  const updated = current.filter((item) => item.id !== id);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to delete history item", e);
  }
}

export function isOnboardingCompleted(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === "true";
  } catch {
    return false;
  }
}

export function setOnboardingCompleted(completed: boolean): void {
  try {
    localStorage.setItem(ONBOARDING_KEY, completed ? "true" : "false");
  } catch (e) {
    console.error("Failed to save onboarding state", e);
  }
}

// Aliases and helpers
export const getUserProfile = getProfile;
export const saveUserProfile = saveProfile;
export const getHistoryItems = getHistory;

export function clearAllData(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(ONBOARDING_KEY);
  } catch (e) {
    console.error("Failed to clear local data", e);
  }
}

export function incrementCompletedTask(): void {
  recordStudyActivity();
}

