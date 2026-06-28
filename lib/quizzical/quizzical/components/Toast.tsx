"use client";

import { useEffect } from "react";

export type ToastState = { message: string; type?: "success" | "error" } | null;

export default function Toast({
  toast,
  onClose,
  duration = 2600,
}: {
  toast: ToastState;
  onClose: () => void;
  duration?: number;
}) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [toast, duration, onClose]);

  if (!toast) return null;

  const isError = toast.type === "error";

  return (
    <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 px-4">
      <div
        role="status"
        className={`flex items-center gap-2 rounded-full border-4 border-ink px-5 py-2.5 font-extrabold shadow-[0_4px_0_0_#0d0d0d] ${
          isError ? "bg-answer1 text-ink" : "bg-grass text-white"
        }`}
      >
        <span>{isError ? "⚠️" : "✓"}</span>
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
