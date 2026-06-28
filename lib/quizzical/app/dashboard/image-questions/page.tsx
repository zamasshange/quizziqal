"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Toast, { type ToastState } from "@/components/Toast";
import {
  IMAGE_CATEGORIES,
  DIFFICULTIES,
  type ImageQuestion,
} from "@/lib/imageQuestions";

export default function ManageImageQuestionsPage() {
  const [questions, setQuestions] = useState<ImageQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastState>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/image-questions", { cache: "no-store" });
      const data: { questions: ImageQuestion[] } = await res.json();
      setQuestions(data.questions ?? []);
    } catch {
      setToast({ message: "Failed to load questions.", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return questions
      .filter((row) => (category ? row.category === category : true))
      .filter((row) => (difficulty ? row.difficulty === difficulty : true))
      .filter((row) =>
        q
          ? row.correct_answer.toLowerCase().includes(q) ||
            row.category.toLowerCase().includes(q)
          : true,
      );
  }, [questions, category, difficulty, search]);

  async function handleDelete(row: ImageQuestion) {
    if (!confirm(`Delete "${row.correct_answer}"? This can't be undone.`)) {
      return;
    }
    setDeletingId(row.id);
    try {
      const res = await fetch(`/api/admin/image-questions/${row.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setQuestions((qs) => qs.filter((q) => q.id !== row.id));
      setToast({ message: "Question deleted.", type: "success" });
    } catch {
      setToast({ message: "Failed to delete.", type: "error" });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold">
            Image Questions Manager
          </h1>
          <p className="font-bold text-ink/60">
            {filtered.length} of {questions.length} questions
          </p>
        </div>
        <Link
          href="/dashboard/image-questions/new"
          className="rounded-full border-4 border-ink bg-grass px-5 py-2.5 font-extrabold text-white shadow-[0_4px_0_0_#0d0d0d] transition-transform hover:-translate-y-0.5"
        >
          + Add question
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by answer or category…"
          className="min-w-48 flex-1 rounded-xl border-2 border-ink/20 px-3 py-2.5 font-semibold outline-none focus:border-ink"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border-2 border-ink/20 px-3 py-2.5 font-semibold outline-none focus:border-ink"
        >
          <option value="">All categories</option>
          {IMAGE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="rounded-xl border-2 border-ink/20 px-3 py-2.5 font-semibold outline-none focus:border-ink"
        >
          <option value="">All difficulties</option>
          {DIFFICULTIES.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-3xl border-4 border-ink bg-white shadow-[0_6px_0_0_#0d0d0d]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b-4 border-ink bg-black/5 text-xs font-extrabold uppercase tracking-wide text-ink/60">
              <tr>
                <th className="p-3">Image</th>
                <th className="p-3">Category</th>
                <th className="p-3">Correct answer</th>
                <th className="p-3">Difficulty</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center font-bold text-ink/50">
                    Loading…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center font-bold text-ink/50">
                    No questions match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-black/10 last:border-0"
                  >
                    <td className="p-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={row.image_url}
                        alt={row.correct_answer}
                        loading="lazy"
                        className="h-12 w-16 rounded-lg border-2 border-ink object-cover"
                      />
                    </td>
                    <td className="p-3 font-bold">{row.category}</td>
                    <td className="p-3 font-extrabold">{row.correct_answer}</td>
                    <td className="p-3">
                      <DifficultyPill difficulty={row.difficulty} />
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/dashboard/image-questions/${row.id}/edit`}
                          className="rounded-full border-2 border-ink bg-white px-3 py-1 text-sm font-extrabold hover:bg-black/5"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(row)}
                          disabled={deletingId === row.id}
                          className="rounded-full border-2 border-ink bg-answer1 px-3 py-1 text-sm font-extrabold text-ink hover:-translate-y-0.5 disabled:opacity-50"
                        >
                          {deletingId === row.id ? "…" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

function DifficultyPill({ difficulty }: { difficulty: string }) {
  const map: Record<string, string> = {
    Easy: "bg-answer4 text-white",
    Medium: "bg-answer3 text-ink",
    Hard: "bg-ink text-white",
  };
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wide ${
        map[difficulty] ?? "bg-black/10 text-ink"
      }`}
    >
      {difficulty}
    </span>
  );
}
