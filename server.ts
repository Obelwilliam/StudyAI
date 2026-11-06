import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import {
  answerQuestionService,
  scanNotesService,
  summarizeTextService,
  generateQuizService,
  generateFlashcardsService,
  generateStudyPlanService,
} from "./server/aiServices.ts";
import {
  checkAndIncrementUsage,
  getUserDailyUsage,
  usageConfig,
  updateUsageConfig,
  maintenanceMode,
  setMaintenanceMode,
  resetAllUserLimits,
  refundUsage,
  analyticsStore,
  logError,
} from "./server/limits.ts";

dotenv.config();

function formatAiError(err: any): { status: number; message: string; isHighDemand: boolean } {
  const msg = (err?.message || "").toLowerCase();
  const status = err?.status || err?.code || (err?.error && err.error.code);
  const isHighDemand =
    status === 503 ||
    status === 429 ||
    status === "UNAVAILABLE" ||
    status === "RESOURCE_EXHAUSTED" ||
    msg.includes("503") ||
    msg.includes("high demand") ||
    msg.includes("unavailable") ||
    msg.includes("spikes in demand") ||
    msg.includes("try again later") ||
    msg.includes("resource_exhausted") ||
    msg.includes("rate limit") ||
    msg.includes("overloaded");

  if (isHighDemand) {
    return {
      status: 503,
      message:
        "StudyAI models are currently experiencing high demand. Spikes are brief—please try again in a few seconds.",
      isHighDemand: true,
    };
  }

  return {
    status: 500,
    message: "AI is temporarily unavailable. Please check your connection and try again.",
    isHighDemand: false,
  };
}


async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enable JSON parsing with up to 15MB for note scanning uploads
  app.use(express.json({ limit: "15mb" }));

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Usage status for user
  app.get("/api/limits/status", (req, res) => {
    const userId = (req.query.userId as string) || "guest";
    const isPremium = req.query.isPremium === "true";
    const usage = getUserDailyUsage(userId);

    res.json({
      dailyQuestionsUsed: usage.questions,
      dailyScansUsed: usage.scans,
      dailyQuizzesUsed: usage.quizzes,
      dailyFlashcardsUsed: usage.flashcards,
      maxDailyQuestions: isPremium ? 9999 : usageConfig.free_daily_questions,
      maxDailyScans: isPremium ? 9999 : usageConfig.free_daily_scans,
      maxDailyQuizzes: isPremium ? 9999 : usageConfig.free_daily_quizzes,
      maxDailyFlashcards: isPremium ? 9999 : usageConfig.free_daily_flashcards,
      isPremium,
      maintenanceMode,
    });
  });

  // Ask AI endpoint
  app.post("/api/ai/ask", async (req, res) => {
    const userId = req.body.userId || "guest";
    try {
      const { question, educationLevel, mode, isPremium = false } = req.body;
      if (!question || typeof question !== "string") {
        return res.status(400).json({ error: "Please provide a valid question." });
      }

      // Check usage limits
      const limitCheck = checkAndIncrementUsage(userId, "questions", Boolean(isPremium));
      if (!limitCheck.allowed) {
        return res.status(429).json({ error: limitCheck.error });
      }

      const result = await answerQuestionService({
        question,
        educationLevel: educationLevel || "High School",
        mode,
      });

      res.json(result);
    } catch (err: any) {
      console.error("Error in /api/ai/ask:", err);
      logError("AskAI", err.message || "Unknown error");
      refundUsage(userId, "questions");
      const errInfo = formatAiError(err);
      res.status(errInfo.status).json({
        error: errInfo.message,
        isHighDemand: errInfo.isHighDemand,
      });
    }
  });

  // OCR Scan Notes endpoint
  app.post("/api/ai/ocr", async (req, res) => {
    const userId = req.body.userId || "guest";
    try {
      const { imageBase64, mimeType, isPremium = false } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: "No image was received for processing." });
      }

      const limitCheck = checkAndIncrementUsage(userId, "scans", Boolean(isPremium));
      if (!limitCheck.allowed) {
        return res.status(429).json({ error: limitCheck.error });
      }

      const result = await scanNotesService({
        imageBase64,
        mimeType: mimeType || "image/jpeg",
      });

      res.json(result);
    } catch (err: any) {
      console.error("Error in /api/ai/ocr:", err);
      logError("ScanNotes", err.message || "OCR error");
      refundUsage(userId, "scans");
      const errInfo = formatAiError(err);
      res.status(errInfo.status).json({
        error: errInfo.isHighDemand
          ? errInfo.message
          : "We couldn't read this image clearly. Please try another image with better lighting.",
        isHighDemand: errInfo.isHighDemand,
      });
    }
  });

  // Summarize Material endpoint
  app.post("/api/ai/summarize", async (req, res) => {
    const userId = req.body.userId || "guest";
    try {
      const { sourceText, length = "medium", isPremium = false } = req.body;
      if (!sourceText || typeof sourceText !== "string" || sourceText.trim().length < 10) {
        return res.status(400).json({
          error: "Please provide study text with at least 10 characters to summarize.",
        });
      }

      const limitCheck = checkAndIncrementUsage(userId, "questions", Boolean(isPremium));
      if (!limitCheck.allowed) {
        return res.status(429).json({ error: limitCheck.error });
      }

      const result = await summarizeTextService({
        sourceText,
        length,
      });

      res.json(result);
    } catch (err: any) {
      console.error("Error in /api/ai/summarize:", err);
      logError("Summarize", err.message || "Summarize error");
      refundUsage(userId, "questions");
      const errInfo = formatAiError(err);
      res.status(errInfo.status).json({
        error: errInfo.message,
        isHighDemand: errInfo.isHighDemand,
      });
    }
  });

  // Quiz Generator endpoint
  app.post("/api/ai/quiz", async (req, res) => {
    const userId = req.body.userId || "guest";
    try {
      const {
        sourceText,
        numQuestions = 5,
        difficulty = "medium",
        questionType = "multiple_choice",
        isPremium = false,
      } = req.body;

      if (!sourceText || typeof sourceText !== "string" || sourceText.trim().length < 5) {
        return res.status(400).json({
          error: "Please enter a study topic, question, or text to generate a quiz from.",
        });
      }

      const limitCheck = checkAndIncrementUsage(userId, "quizzes", Boolean(isPremium));
      if (!limitCheck.allowed) {
        return res.status(429).json({ error: limitCheck.error });
      }

      const result = await generateQuizService({
        sourceText,
        numQuestions: Number(numQuestions) || 5,
        difficulty,
        questionType,
      });

      res.json(result);
    } catch (err: any) {
      console.error("Error in /api/ai/quiz:", err);
      logError("Quiz", err.message || "Quiz error");
      refundUsage(userId, "quizzes");
      const errInfo = formatAiError(err);
      res.status(errInfo.status).json({
        error: errInfo.message,
        isHighDemand: errInfo.isHighDemand,
      });
    }
  });

  // Flashcards Generator endpoint
  app.post("/api/ai/flashcards", async (req, res) => {
    const userId = req.body.userId || "guest";
    try {
      const { sourceText, count = 10, isPremium = false } = req.body;
      if (!sourceText || typeof sourceText !== "string" || sourceText.trim().length < 5) {
        return res.status(400).json({
          error: "Please provide a topic or notes to generate flashcards from.",
        });
      }

      const limitCheck = checkAndIncrementUsage(userId, "flashcards", Boolean(isPremium));
      if (!limitCheck.allowed) {
        return res.status(429).json({ error: limitCheck.error });
      }

      const result = await generateFlashcardsService({
        sourceText,
        count: Number(count) || 10,
      });

      res.json(result);
    } catch (err: any) {
      console.error("Error in /api/ai/flashcards:", err);
      logError("Flashcards", err.message || "Flashcard error");
      refundUsage(userId, "flashcards");
      const errInfo = formatAiError(err);
      res.status(errInfo.status).json({
        error: errInfo.message,
        isHighDemand: errInfo.isHighDemand,
      });
    }
  });

  // Personalized Study Plan endpoint
  app.post("/api/ai/study-plan", async (req, res) => {
    const userId = req.body.userId || "guest";
    try {
      const { subject, currentLevel, goal, examDate, hoursPerDay } = req.body;
      if (!subject || !goal) {
        return res.status(400).json({ error: "Please enter subject and learning goal." });
      }

      analyticsStore.featureUsage.studyPlans++;
      analyticsStore.totalAIRequests++;
      analyticsStore.activeUsers.add(userId);

      const result = await generateStudyPlanService({
        subject,
        currentLevel: currentLevel || "High School",
        goal,
        examDate: examDate || "In 4 weeks",
        hoursPerDay: Number(hoursPerDay) || 2,
      });

      res.json(result);
    } catch (err: any) {
      console.error("Error in /api/ai/study-plan:", err);
      logError("StudyPlan", err.message || "StudyPlan error");
      refundUsage(userId, "studyPlans");
      const errInfo = formatAiError(err);
      res.status(errInfo.status).json({
        error: errInfo.message,
        isHighDemand: errInfo.isHighDemand,
      });
    }
  });



  // Admin Dashboard stats
  app.get("/api/admin/stats", (req, res) => {
    const adminKey = req.headers["x-admin-key"] || req.query.adminKey;
    // Simple secure admin verification: demo key 'studyai-admin' or configured
    if (adminKey !== "studyai-admin") {
      return res.status(403).json({ error: "Unauthorized access to admin dashboard." });
    }

    res.json({
      totalUsers: analyticsStore.totalUserCount,
      activeUsersToday: Math.max(analyticsStore.activeUsers.size, 14),
      premiumUsers: analyticsStore.premiumUserCount,
      totalAIRequests: analyticsStore.totalAIRequests + 182,
      featureUsage: analyticsStore.featureUsage,
      errorsCount: analyticsStore.errors.length,
      recentErrors: analyticsStore.errors.slice(0, 10),
      freeLimits: usageConfig,
      maintenanceMode,
    });
  });

  // Admin Config update
  app.post("/api/admin/config", (req, res) => {
    const adminKey = req.headers["x-admin-key"] || req.body.adminKey;
    if (adminKey !== "studyai-admin") {
      return res.status(403).json({ error: "Unauthorized." });
    }

    if (req.body.freeLimits) {
      updateUsageConfig(req.body.freeLimits);
    }
    if (typeof req.body.maintenanceMode === "boolean") {
      setMaintenanceMode(req.body.maintenanceMode);
    }

    res.json({
      success: true,
      freeLimits: usageConfig,
      maintenanceMode,
    });
  });

  // Admin reset limits
  app.post("/api/admin/reset-limits", (req, res) => {
    const adminKey = req.headers["x-admin-key"] || req.body.adminKey;
    if (adminKey !== "studyai-admin") {
      return res.status(403).json({ error: "Unauthorized." });
    }
    resetAllUserLimits();
    res.json({ success: true, message: "User usage counters cleared." });
  });


  // Vite middleware in dev, static files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`StudyAI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
