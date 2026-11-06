export interface UsageConfig {
  free_daily_questions: number;
  free_daily_scans: number;
  free_daily_quizzes: number;
  free_daily_flashcards: number;
}

export let usageConfig: UsageConfig = {
  free_daily_questions: 5,
  free_daily_scans: 2,
  free_daily_quizzes: 2,
  free_daily_flashcards: 3,
};

export let maintenanceMode = false;

interface DailyUserUsage {
  date: string;
  questions: number;
  scans: number;
  quizzes: number;
  flashcards: number;
}

// In-memory usage store indexed by userId or IP
const userUsageMap = new Map<string, DailyUserUsage>();

export const analyticsStore = {
  totalAIRequests: 0,
  activeUsers: new Set<string>(),
  featureUsage: {
    questions: 0,
    scans: 0,
    summaries: 0,
    quizzes: 0,
    flashcards: 0,
    studyPlans: 0,
  },
  errors: [] as Array<{ timestamp: string; feature: string; message: string }>,
  premiumUserCount: 12,
  totalUserCount: 84,
};

function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getUserDailyUsage(userId: string): DailyUserUsage {
  const today = getTodayString();
  const existing = userUsageMap.get(userId);
  if (!existing || existing.date !== today) {
    const fresh: DailyUserUsage = {
      date: today,
      questions: 0,
      scans: 0,
      quizzes: 0,
      flashcards: 0,
    };
    userUsageMap.set(userId, fresh);
    return fresh;
  }
  return existing;
}

export function checkAndIncrementUsage(
  userId: string,
  feature: "questions" | "scans" | "quizzes" | "flashcards",
  isPremium: boolean
): { allowed: boolean; limit: number; current: number; error?: string } {
  if (maintenanceMode) {
    return {
      allowed: false,
      limit: 0,
      current: 0,
      error: "StudyAI is currently undergoing scheduled maintenance. Please try again soon.",
    };
  }

  // Premium users have high fair-use limits
  if (isPremium) {
    analyticsStore.totalAIRequests++;
    analyticsStore.activeUsers.add(userId);
    if (feature in analyticsStore.featureUsage) {
      analyticsStore.featureUsage[feature as keyof typeof analyticsStore.featureUsage]++;
    }
    return { allowed: true, limit: 9999, current: 0 };
  }

  const usage = getUserDailyUsage(userId);
  const limit = usageConfig[`free_daily_${feature}` as keyof UsageConfig] || 5;

  if (usage[feature] >= limit) {
    return {
      allowed: false,
      limit,
      current: usage[feature],
      error: `You've reached today's free limit for ${feature} (${limit}/${limit}). Upgrade to Premium for unlimited access or try again tomorrow!`,
    };
  }

  usage[feature]++;
  analyticsStore.totalAIRequests++;
  analyticsStore.activeUsers.add(userId);
  if (feature in analyticsStore.featureUsage) {
    analyticsStore.featureUsage[feature as keyof typeof analyticsStore.featureUsage]++;
  }

  return {
    allowed: true,
    limit,
    current: usage[feature],
  };
}

export function updateUsageConfig(newConfig: Partial<UsageConfig>) {
  usageConfig = { ...usageConfig, ...newConfig };
}

export function setMaintenanceMode(enabled: boolean) {
  maintenanceMode = enabled;
}

export function resetAllUserLimits() {
  userUsageMap.clear();
}

export function refundUsage(
  userId: string,
  feature: "questions" | "scans" | "quizzes" | "flashcards" | "summaries" | "studyPlans"
) {
  const usage = getUserDailyUsage(userId);
  if (feature in usage && (usage as any)[feature] > 0) {
    (usage as any)[feature]--;
  }
  if (feature in analyticsStore.featureUsage && analyticsStore.featureUsage[feature as keyof typeof analyticsStore.featureUsage] > 0) {
    analyticsStore.featureUsage[feature as keyof typeof analyticsStore.featureUsage]--;
  }
}

export function logError(feature: string, message: string) {


  analyticsStore.errors.unshift({
    timestamp: new Date().toISOString(),
    feature,
    message,
  });
  if (analyticsStore.errors.length > 50) {
    analyticsStore.errors.pop();
  }
}
