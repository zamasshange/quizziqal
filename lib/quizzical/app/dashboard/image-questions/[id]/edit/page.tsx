import Link from "next/link";
import { notFound } from "next/navigation";
import ImageQuestionForm from "@/components/ImageQuestionForm";
import { getImageQuestion } from "@/lib/imageQuestionsStore";

export const dynamic = "force-dynamic";

export default async function EditImageQuestionPage(
  props: PageProps<"/dashboard/image-questions/[id]/edit">,
) {
  const { id } = await props.params;
  const question = await getImageQuestion(id);

  if (!question) {
    notFound();
  }

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
          Edit image question
        </h1>
      </div>
      <ImageQuestionForm mode="edit" initial={question} />
    </div>
  );
}
