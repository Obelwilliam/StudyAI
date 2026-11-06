import { GoogleGenAI, Type } from "@google/genai";

// Lazy-initialized GoogleGenAI client
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured on the server");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Model pool for high reliability during temporary demand spikes:
// Primary: gemini-3.8-flash
// High-resilience fast fallback: gemini-3.1-flash-lite
const modelHealth: Record<string, { degradedUntil: number }> = {
  "gemini-3.8-flash": { degradedUntil: 0 },
  "gemini-3.1-flash-lite": { degradedUntil: 0 },
};

function getPrioritizedModels(): string[] {
  const now = Date.now();
  const primaryHealthy = (modelHealth["gemini-3.8-flash"]?.degradedUntil || 0) < now;
  if (primaryHealthy) {
    return ["gemini-3.8-flash", "gemini-3.1-flash-lite"];
  }
  // When primary has recent 503s, route straight to flash-lite for sub-second responses
  return ["gemini-3.1-flash-lite", "gemini-3.8-flash"];
}

function isTransientError(err: any): boolean {
  const msg = (err?.message || "").toLowerCase();
  const status = err?.status || err?.code || (err?.error && err.error.code);
  return (
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
    msg.includes("overloaded")
  );
}

export function cleanAndParseJson(text: string): any {
  if (!text) return {};
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/i, "").replace(/\s*```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }
  return JSON.parse(cleaned);
}

/**
 * Resilient Gemini API caller with automatic circuit-breaker and
 * instant fallback to gemini-3.1-flash-lite when gemini-3.8-flash has a demand spike.
 */
async function callGeminiWithFallback(
  requestBuilder: (modelName: string) => Promise<any>
) {
  let lastError: any = null;
  const modelsToTry = getPrioritizedModels();

  for (const model of modelsToTry) {
    try {
      const response = await requestBuilder(model);
      // Model succeeded: if it was gemini-3.8-flash, ensure circuit breaker is clear
      if (model === "gemini-3.8-flash") {
        modelHealth[model].degradedUntil = 0;
      }
      return response;
    } catch (err: any) {
      lastError = err;
      if (isTransientError(err)) {
        // Mark model as experiencing temporary high demand for 3 minutes
        modelHealth[model] = { degradedUntil: Date.now() + 3 * 60 * 1000 };
        console.info(
          `[AI Router] Model ${model} is experiencing a temporary demand spike. Failing over immediately to backup...`
        );
        // Continue immediately to next model in the pool with zero delay
        continue;
      } else {
        // Non-transient errors (e.g. invalid arguments) are thrown immediately
        throw err;
      }
    }
  }

  throw lastError;
}

/**
 * Modular AI Question Answering with Education Level adaptation
 */
export async function answerQuestionService(params: {
  question: string;
  educationLevel: string;
  mode?: "default" | "simple" | "detailed" | "example";
}) {
  const ai = getAiClient();
  const { question, educationLevel, mode = "default" } = params;

  const systemInstruction = `You are StudyAI, an empathetic, highly knowledgeable, and encouraging academic tutor.
Your audience has education level: ${educationLevel}.
Requirements:
1. Provide accurate, clear, and structured educational explanations.
2. For scientific questions, calculations, or factual subjects, distinguish established facts from theory or uncertainty. If you are uncertain or if academic consensus varies, state so explicitly rather than inventing facts.
3. Keep the language natural and engaging for a ${educationLevel} student.
4. Output in valid JSON conforming to the requested schema.`;

  const prompt = `Student Question: "${question}"
Requested focus: ${mode}
Provide:
1. simpleExplanation: A clear, accessible 2-3 sentence explanation anyone can grasp.
2. detailedExplanation: A structured academic explanation with key insights, breakdown, and terminology.
3. importantPoints: 3 to 5 vital bullet points or rules to remember.
4. example: A concrete, practical real-world example or worked sample problem.
5. relatedQuestions: 3 thoughtful follow-up questions the student should test themselves on next.`;

  const response = await callGeminiWithFallback((model) =>
    ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.4,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            simpleExplanation: { type: Type.STRING },
            detailedExplanation: { type: Type.STRING },
            importantPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            example: { type: Type.STRING },
            relatedQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            "simpleExplanation",
            "detailedExplanation",
            "importantPoints",
            "example",
            "relatedQuestions",
          ],
        },
      },
    })
  );

  return cleanAndParseJson(response.text || "{}");
}

/**
 * Modular OCR / Multimodal Note Scanner
 */
export async function scanNotesService(params: {
  imageBase64: string;
  mimeType: string;
}) {
  const ai = getAiClient();
  const { imageBase64, mimeType } = params;

  const base64Data = imageBase64.includes("base64,")
    ? imageBase64.split("base64,")[1]
    : imageBase64;

  const systemInstruction = `You are an expert OCR transcription engine specializing in handwritten notes, printed textbooks, lecture whiteboards, and student worksheets.
Your job is to faithfully transcribe the text from the image while retaining clean line breaks, formulas, headings, and bullet points.
If the image is too blurry, dark, unreadable, or doesn't contain any readable text, report isReadable as false and provide a helpful message for the student.`;

  const prompt = `Please transcribe the study notes from this image.
Preserve headings, bullet points, numbered steps, equations, and diagrams text.
If the text is unreadable, explain why gracefully.`;

  const response = await callGeminiWithFallback((model) =>
    ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || "image/jpeg",
              data: base64Data,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        systemInstruction,
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isReadable: { type: Type.BOOLEAN },
            extractedText: { type: Type.STRING },
            errorMessage: { type: Type.STRING },
            titleSuggestion: { type: Type.STRING },
          },
          required: ["isReadable", "extractedText"],
        },
      },
    })
  );

  const parsed = cleanAndParseJson(response.text || "{}");

  if (!parsed.isReadable || !parsed.extractedText?.trim()) {
    return {
      success: false,
      extractedText: "",
      error:
        parsed.errorMessage ||
        "Unable to read this image clearly. Try taking another photo with better lighting.",
    };
  }

  return {
    success: true,
    extractedText: parsed.extractedText.trim(),
    titleSuggestion: parsed.titleSuggestion || "Scanned Notes",
  };
}

/**
 * Modular Summarizer
 */
export async function summarizeTextService(params: {
  sourceText: string;
  length: "short" | "medium" | "detailed";
}) {
  const ai = getAiClient();
  const { sourceText, length } = params;

  const lengthInstructions = {
    short: "Approximately 3-5 high-impact bullet points and a concise 2-sentence executive summary.",
    medium: "A balanced study summary covering all major concepts, logical steps, and key findings.",
    detailed: "A comprehensive study guide covering all sections, definitions, subtleties, and core takeaways without fluff.",
  };

  const systemInstruction = `You are StudyAI's specialized academic summarizer.
Produce a structured summary strictly based on the provided material.
Length requirement: ${lengthInstructions[length]}`;

  const prompt = `Study Material to summarize:
"""
${sourceText.slice(0, 12000)}
"""

Extract:
1. title: A fitting concise title for these study notes.
2. summary: The synthesized overview.
3. keyPoints: Array of 3 to 7 crucial key takeaways.
4. importantTerms: Array of objects with term and definition for key vocabulary.
5. mainConcepts: Array of 3 to 5 central conceptual themes.`;

  const response = await callGeminiWithFallback((model) =>
    ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.3,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            keyPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            importantTerms: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  definition: { type: Type.STRING },
                },
                required: ["term", "definition"],
              },
            },
            mainConcepts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["title", "summary", "keyPoints", "importantTerms", "mainConcepts"],
        },
      },
    })
  );

  return cleanAndParseJson(response.text || "{}");
}

/**
 * Modular Quiz Generator
 */
export async function generateQuizService(params: {
  sourceText: string;
  numQuestions: number;
  difficulty: "easy" | "medium" | "hard";
  questionType: "multiple_choice" | "true_false" | "mixed";
}) {
  const ai = getAiClient();
  const { sourceText, numQuestions, difficulty, questionType } = params;

  const count = Math.min(Math.max(Number(numQuestions) || 5, 3), 20);

  const systemInstruction = `You are StudyAI's pedagogical quiz architect.
Create an academic quiz with exactly ${count} questions based on the provided topic or text.
Difficulty level: ${difficulty}.
Allowed question types: ${questionType}.
Requirements:
1. Every question must test deep conceptual understanding rather than trivial trivia.
2. Multiple choice questions must have 4 distinct options (A, B, C, D) with exactly one clearly correct answer.
3. True/False questions must have options ["True", "False"].
4. Provide a clear educational explanation for why the correct answer is right and why distractors are wrong.`;

  const prompt = `Topic or Material:
"""
${sourceText.slice(0, 10000)}
"""

Generate a quiz with ${count} questions.`;

  const response = await callGeminiWithFallback((model) =>
    ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.4,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  type: {
                    type: Type.STRING,
                    description: "either 'multiple_choice' or 'true_false'",
                  },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                },
                required: [
                  "id",
                  "question",
                  "type",
                  "options",
                  "correctAnswer",
                  "explanation",
                ],
              },
            },
          },
          required: ["title", "questions"],
        },
      },
    })
  );

  const parsed = cleanAndParseJson(response.text || "{}");

  if (parsed.questions && Array.isArray(parsed.questions)) {
    parsed.questions = parsed.questions.map((q: any, idx: number) => ({
      ...q,
      id: q.id || `q_${Date.now()}_${idx}`,
    }));
  }

  return parsed;
}

/**
 * Modular Flashcards Generator
 */
export async function generateFlashcardsService(params: {
  sourceText: string;
  count?: number;
}) {
  const ai = getAiClient();
  const { sourceText, count = 10 } = params;
  const targetCount = Math.min(Math.max(count, 4), 25);

  const systemInstruction = `You are StudyAI's flashcard creator.
Generate active-recall flashcards from the provided study material.
Target count: ${targetCount} cards.
Front side: A concise, thought-provoking question, formula prompt, or term.
Back side: A clear, high-retention answer or definition that is easy to memorize.`;

  const prompt = `Study Material:
"""
${sourceText.slice(0, 10000)}
"""
Generate a high-yield flashcard deck.`;

  const response = await callGeminiWithFallback((model) =>
    ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.35,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            cards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  front: { type: Type.STRING },
                  back: { type: Type.STRING },
                },
                required: ["id", "front", "back"],
              },
            },
          },
          required: ["title", "cards"],
        },
      },
    })
  );

  const parsed = cleanAndParseJson(response.text || "{}");

  if (parsed.cards && Array.isArray(parsed.cards)) {
    parsed.cards = parsed.cards.map((c: any, idx: number) => ({
      ...c,
      id: c.id || `fc_${Date.now()}_${idx}`,
      isLearned: false,
      isDifficult: false,
    }));
  }

  return parsed;
}

/**
 * Modular Study Plan Generator
 */
export async function generateStudyPlanService(params: {
  subject: string;
  currentLevel: string;
  goal: string;
  examDate: string;
  hoursPerDay: number;
}) {
  const ai = getAiClient();
  const { subject, currentLevel, goal, examDate, hoursPerDay } = params;

  const systemInstruction = `You are StudyAI's master educational curriculum planner.
Create a realistic, motivating, and structured study roadmap for a student.
Subject: ${subject}
Current Level: ${currentLevel}
Goal: ${goal}
Exam / Target Date: ${examDate}
Study Time: ${hoursPerDay} hours per day
Generate a 3 to 4 week plan. Each week must have a clear theme, key focus topics, and 4-6 specific actionable activities with durations in minutes.`;

  const prompt = `Create the complete study roadmap for ${subject}.`;

  const response = await callGeminiWithFallback((model) =>
    ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.3,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            weeks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  weekNumber: { type: Type.INTEGER },
                  theme: { type: Type.STRING },
                  focusTopics: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  activities: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        durationMinutes: { type: Type.INTEGER },
                      },
                      required: ["id", "title", "description", "durationMinutes"],
                    },
                  },
                },
                required: ["weekNumber", "theme", "focusTopics", "activities"],
              },
            },
          },
          required: ["weeks"],
        },
      },
    })
  );

  const parsed = cleanAndParseJson(response.text || "{}");

  if (parsed.weeks && Array.isArray(parsed.weeks)) {
    parsed.weeks = parsed.weeks.map((w: any) => ({
      ...w,
      activities: (w.activities || []).map((a: any, idx: number) => ({
        ...a,
        id: a.id || `act_${w.weekNumber}_${idx}`,
        isCompleted: false,
      })),
    }));
  }

  return parsed;
}
