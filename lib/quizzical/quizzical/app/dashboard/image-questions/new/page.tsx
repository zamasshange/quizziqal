import Link from "next/link";
import ImageQuestionForm from "@/components/ImageQuestionForm";

export default function NewImageQuestionPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <Link
          href="/dashboard/image-questions"
          className="text-sm font-bold text-ink/50 hover:text-ink"
        >
          ← Back to questions
        </Link>
        <h1 className="font-display text-3xl font-extrabold">
          Add image question
        </h1>
      </div>
      <ImageQuestionForm mode="create" />
    </div>
  );
}
