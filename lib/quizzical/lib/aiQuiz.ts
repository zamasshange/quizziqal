// AI quiz generator (OpenRouter) — builds a playable text quiz from any topic.

import type { Quiz, Question } from "./quizzes";

const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

export type AiQuizResult =
  | { ok: true; quiz: Quiz }
  | { ok: false; error: string };

export async function generateAiQuiz(
  topic: string,
  count: number,
  difficulty: string,
): Promise<AiQuizResult> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    return { ok: false, error: "AI is not configured (missing API key)." };
  }

  const model = process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini";
  const n = Math.min(Math.max(count, 3), 10);

  const prompt =
    `Create a ${difficulty} multiple-choice quiz about "${topic}" with exactly ${n} questions. ` +
    `Each question must have exactly 4 answer options with only ONE correct answer. ` +
    `Return ONLY valid JSON (no markdown) in this exact shape: ` +
    `{"title": string, "questions": [{"question": string, "answers": [string, string, string, string], "correct": number}]}. ` +
    `"correct" is the 0-based index of the right answer.`;

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "X-Title": "Quizzical",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      return { ok: false, error: "The AI service is unavailable right now." };
    }

    const data = await res.json();
    const text: string = data?.choices?.[0]?.message?.content ?? "";
    const json = extractJson(text);
    if (!json) return { ok: false, error: "The AI returned an invalid quiz." };

    const questions = parseQuestions(json.questions);
    if (questions.length === 0) {
      return { ok: false, error: "The AI couldn't build a quiz for that topic." };
    }

    const quiz: Quiz = {
      id: `ai-${Date.now()}`,
      title:
        typeof json.title === "string" && json.title.trim()
          ? json.title.trim()
          : `${topic} Quiz`,
      description: `An AI-generated quiz about ${topic}.`,
      category: "trivia",
      emoji: "🤖",
      color: "#5b19df",
      plays: 0,
      author: "Quizzical AI",
      rating: 0,
      badge: "AI",
      questions,
    };

    return { ok: true, quiz };
  } catch {
    return { ok: false, error: "Something went wrong generating the quiz." };
  }
}

function extractJson(text: string): { title?: unknown; questions?: unknown } | null {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function parseQuestions(raw: unknown): Question[] {
  if (!Array.isArray(raw)) return [];
  const out: Question[] = [];
  raw.forEach((item, i) => {
    if (typeof item !== "object" || item === null) return;
    const q = item as Record<string, unknown>;
    const text = q.question;
    const answers = q.answers;
    const correct = q.correct;
    if (
      typeof text !== "string" ||
      !Array.isArray(answers) ||
      answers.length !== 4 ||
      answers.some((a) => typeof a !== "string") ||
      typeof correct !== "number" ||
      correct < 0 ||
      correct > 3
    ) {
      return;
    }
    out.push({
      id: `aiq-${i}`,
      text,
      answers: answers as string[],
      correct: Math.floor(correct),
    });
  });
  return out;
}
