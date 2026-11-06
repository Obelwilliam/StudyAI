export type EducationLevel = 'Beginner' | 'High School' | 'University' | 'Advanced';

export type PlanType = 'free' | 'premium';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  educationLevel: EducationLevel;
  mainSubjects: string[];
  learningGoals: string;
  plan: PlanType;
  studyStreak: number;
  lastStudyDate: string;
  completedTasksToday: number;
  darkMode: boolean;
  language: string;
  notificationsEnabled: boolean;
  hasCompletedOnboarding?: boolean;
  createdAt: string;
}

export interface AskAIResult {
  id: string;
  question: string;
  educationLevel: EducationLevel;
  simpleExplanation: string;
  detailedExplanation: string;
  importantPoints: string[];
  example: string;
  relatedQuestions: string[];
  createdAt: string;
}

export interface ScannedNote {
  id: string;
  title: string;
  extractedText: string;
  imageUrl?: string;
  createdAt: string;
}

export interface SummaryResult {
  id: string;
  title: string;
  sourceText: string;
  length: 'short' | 'medium' | 'detailed';
  summary: string;
  keyPoints: string[];
  importantTerms: Array<{ term: string; definition: string }>;
  mainConcepts: string[];
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false';
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface QuizResult {
  id: string;
  title: string;
  subject?: string;
  questions: QuizQuestion[];
  userAnswers: Record<string, string>;
  score: number;
  total: number;
  percentage: number;
  createdAt: string;
}

export interface FlashcardItem {
  id: string;
  front: string;
  back: string;
  isLearned?: boolean;
  isDifficult?: boolean;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  subject?: string;
  cards: FlashcardItem[];
  createdAt: string;
}

export interface StudyPlanActivity {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  isCompleted: boolean;
}

export interface StudyPlanWeek {
  weekNumber: number;
  theme: string;
  focusTopics: string[];
  activities: StudyPlanActivity[];
}

export interface StudyPlan {
  id: string;
  subject: string;
  currentLevel: EducationLevel;
  goal: string;
  examDate: string;
  hoursPerDay: number;
  weeks: StudyPlanWeek[];
  progress: number;
  createdAt: string;
}

export type HistoryItemType = 'question' | 'summary' | 'quiz' | 'flashcard' | 'scan' | 'plan';

export interface HistoryItem {
  id: string;
  type: HistoryItemType;
  title: string;
  preview: string;
  createdAt: string;
  data: any;
}

export interface UsageStatus {
  dailyQuestionsUsed: number;
  dailyScansUsed: number;
  dailyQuizzesUsed: number;
  maxDailyQuestions: number;
  maxDailyScans: number;
  maxDailyQuizzes: number;
  isPremium: boolean;
}

export interface AdminStats {
  totalUsers: number;
  activeUsersToday: number;
  premiumUsers: number;
  totalAIRequests: number;
  featureUsage: {
    questions: number;
    scans: number;
    summaries: number;
    quizzes: number;
    flashcards: number;
    studyPlans: number;
  };
  errorsCount: number;
  freeLimits: {
    free_daily_questions: number;
    free_daily_scans: number;
    free_daily_quizzes: number;
  };
  maintenanceMode: boolean;
}
