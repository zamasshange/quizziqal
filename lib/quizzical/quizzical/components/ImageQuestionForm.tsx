"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button3D from "./Button3D";
import Toast, { type ToastState } from "./Toast";
import {
  IMAGE_CATEGORIES,
  DIFFICULTIES,
  type ImageCategory,
  type Difficulty,
  type ImageQuestion,
} from "@/lib/imageQuestions";

type Props = {
  mode: "create" | "edit";
  initial?: ImageQuestion;
};

const inputClass =
  "w-full rounded-xl border-2 border-ink/20 px-3 py-2.5 font-semibold outline-none focus:border-ink";

const emptyState = {
  category: "Celebrity" as ImageCategory,
  image_url: "",
  question: "Who is this?",
  correct_answer: "",
  wrong_0: "",
  wrong_1: "",
  wrong_2: "",
  difficulty: "Easy" as Difficulty,
};

export default function ImageQuestionForm({ mode, initial }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const [form, setForm] = useState(() =>
    initial
      ? {
          category: initial.category,
          image_url: initial.image_url,
          question: initial.question,
          correct_answer: initial.correct_answer,
          wrong_0: initial.wrong_answers[0] ?? "",
          wrong_1: initial.wrong_answers[1] ?? "",
          wrong_2: initial.wrong_answers[2] ?? "",
          difficulty: initial.difficulty,
        }
      : emptyState,
  );

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      category: form.category,
      image_url: form.image_url.trim(),
      question: form.question.trim() || "Who is this?",
      correct_answer: form.correct_answer.trim(),
      wrong_answers: [
        form.wrong_0.trim(),
        form.wrong_1.trim(),
        form.wrong_2.trim(),
      ],
      difficulty: form.difficulty,
    };

    try {
      const res =
        mode === "create"
          ? await fetch("/api/admin/image-questions", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
          : await fetch(`/api/admin/image-questions/${initial!.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Something went wrong.");
      }

      if (mode === "create") {
        setToast({ message: "Question added!", type: "success" });
        setForm(emptyState);
      } else {
        setToast({ message: "Question updated!", type: "success" });
        router.refresh();
        setTimeout(() => router.push("/dashboard/image-questions"), 700);
      }
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : "Failed to save.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="grid gap-5 rounded-3xl border-4 border-ink bg-white p-6 shadow-[0_6px_0_0_#0d0d0d] md:grid-cols-2"
      >
        <Field label="Category">
          <select
            value={form.category}
            onChange={(e) => set("category", e.target.value as ImageCategory)}
            className={inputClass}
          >
            {IMAGE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Difficulty">
          <select
            value={form.difficulty}
            onChange={(e) => set("difficulty", e.target.value as Difficulty)}
            className={inputClass}
          >
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Image URL" full>
          <input
            required
            type="url"
            placeholder="https://…"
            value={form.image_url}
            onChange={(e) => set("image_url", e.target.value)}
            className={inputClass}
          />
          {form.image_url.trim() && (
            <div className="mt-2 overflow-hidden rounded-xl border-2 border-ink/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.image_url}
                alt="Preview"
                loading="lazy"
                className="aspect-[3/2] w-full object-cover"
              />
            </div>
          )}
        </Field>

        <Field label="Question" full>
          <input
            value={form.question}
            onChange={(e) => set("question", e.target.value)}
            placeholder="Who is this?"
            className={inputClass}
          />
        </Field>

        <Field label="Correct answer" full>
          <input
            required
            value={form.correct_answer}
            onChange={(e) => set("correct_answer", e.target.value)}
            className={`${inputClass} border-grass`}
          />
        </Field>

        <Field label="Wrong answer 1">
          <input
            required
            value={form.wrong_0}
            onChange={(e) => set("wrong_0", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Wrong answer 2">
          <input
            required
            value={form.wrong_1}
            onChange={(e) => set("wrong_1", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Wrong answer 3">
          <input
            required
            value={form.wrong_2}
            onChange={(e) => set("wrong_2", e.target.value)}
            className={inputClass}
          />
        </Field>

        <div className="flex items-center gap-3 md:col-span-2">
          <Button3D type="submit" variant="grass" size="lg">
            {submitting
              ? "Saving…"
              : mode === "create"
                ? "Add question"
                : "Save changes"}
          </Button3D>
        </div>
      </form>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${full ? "md:col-span-2" : ""}`}>
      <span className="text-xs font-extrabold uppercase tracking-wide text-ink/50">
        {label}
      </span>
      {children}
    </label>
  );
}
