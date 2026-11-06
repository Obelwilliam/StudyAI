import { EducationLevel } from "../types";

export interface ApiClientOptions {
  userId?: string;
  isPremium?: boolean;
}

export class ApiError extends Error {
  isLimitError: boolean;
  isHighDemand: boolean;
  constructor(message: string, isLimitError = false, isHighDemand = false) {
    super(message);
    this.name = "ApiError";
    this.isLimitError = isLimitError;
    this.isHighDemand = isHighDemand;
  }
}

async function handleResponse(response: Response) {
  if (response.status === 429) {
    const data = await response.json().catch(() => ({}));
    throw new ApiError(
      data.error || "You've reached today's free AI limit. Try again tomorrow or upgrade to Premium.",
      true,
      false
    );
  }

  if (response.status === 503) {
    const data = await response.json().catch(() => ({}));
    throw new ApiError(
      data.error || "StudyAI models are currently experiencing high demand. Please try again in a few seconds.",
      false,
      true
    );
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new ApiError(
      data.error || "AI is temporarily unavailable. Please try again."
    );
  }

  return await response.json();
}

export async function askAIQuestion(
  question: string,
  educationLevel: EducationLevel,
  mode: "default" | "simple" | "detailed" | "example" = "default",
  options: ApiClientOptions = {}
) {
  if (!navigator.onLine) {
    throw new ApiError("You are offline. Please check your internet connection.");
  }

  const res = await fetch("/api/ai/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question,
      educationLevel,
      mode,
      userId: options.userId || "guest",
      isPremium: options.isPremium || false,
    }),
  });

  return handleResponse(res);
}

export async function scanNotesOCR(
  imageBase64: string,
  mimeType: string,
  options: ApiClientOptions = {}
) {
  if (!navigator.onLine) {
    throw new ApiError("You are offline. Image OCR requires an internet connection.");
  }

  const res = await fetch("/api/ai/ocr", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      imageBase64,
      mimeType,
      userId: options.userId || "guest",
      isPremium: options.isPremium || false,
    }),
  });

  return handleResponse(res);
}

export async function summarizeText(
  sourceText: string,
  length: "short" | "medium" | "detailed",
  options: ApiClientOptions = {}
) {
  if (!navigator.onLine) {
    throw new ApiError("You are offline. Summarization requires an internet connection.");
  }

  const res = await fetch("/api/ai/summarize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sourceText,
      length,
      userId: options.userId || "guest",
      isPremium: options.isPremium || false,
    }),
  });

  return handleResponse(res);
}

export async function generateQuiz(
  sourceText: string,
  numQuestions: number,
  difficulty: "easy" | "medium" | "hard",
  questionType: "multiple_choice" | "true_false" | "mixed",
  options: ApiClientOptions = {}
) {
  if (!navigator.onLine) {
    throw new ApiError("You are offline. Quiz generation requires an internet connection.");
  }

  const res = await fetch("/api/ai/quiz", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sourceText,
      numQuestions,
      difficulty,
      questionType,
      userId: options.userId || "guest",
      isPremium: options.isPremium || false,
    }),
  });

  return handleResponse(res);
}

export async function generateFlashcards(
  sourceText: string,
  count = 10,
  options: ApiClientOptions = {}
) {
  if (!navigator.onLine) {
    throw new ApiError("You are offline. Flashcard generation requires an internet connection.");
  }

  const res = await fetch("/api/ai/flashcards", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sourceText,
      count,
      userId: options.userId || "guest",
      isPremium: options.isPremium || false,
    }),
  });

  return handleResponse(res);
}

export async function generateStudyPlan(
  subject: string,
  currentLevel: EducationLevel,
  goal: string,
  examDate: string,
  hoursPerDay: number,
  options: ApiClientOptions = {}
) {
  if (!navigator.onLine) {
    throw new ApiError("You are offline. Study plan generation requires an internet connection.");
  }

  const res = await fetch("/api/ai/study-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      subject,
      currentLevel,
      goal,
      examDate,
      hoursPerDay,
      userId: options.userId || "guest",
      isPremium: options.isPremium || false,
    }),
  });

  return handleResponse(res);
}

export async function fetchUsageStatus(userId: string, isPremium: boolean) {
  const res = await fetch(
    `/api/limits/status?userId=${encodeURIComponent(userId)}&isPremium=${isPremium}`
  );
  if (!res.ok) return null;
  return await res.json();
}

export async function fetchAdminStats(adminKey = "studyai-admin") {
  const res = await fetch(`/api/admin/stats?adminKey=${encodeURIComponent(adminKey)}`);
  if (!res.ok) {
    throw new ApiError("Failed to fetch admin stats. Check your secret key.");
  }
  return await res.json();
}

export async function resetUsageLimits(adminKey = "studyai-admin") {
  const res = await fetch("/api/admin/reset-limits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ adminKey }),
  });
  if (!res.ok) {
    throw new ApiError("Failed to reset limits.");
  }
  return await res.json();
}

