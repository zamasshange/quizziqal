import { NextResponse } from "next/server";
import {
  deleteImageQuestion,
  getImageQuestion,
  updateImageQuestion,
} from "@/lib/imageQuestionsStore";
import {
  validateImageQuestionPayload,
  type NewImageQuestion,
} from "@/lib/imageQuestions";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Ctx) {
  const { id } = await params;
  if (!(await getImageQuestion(id))) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const error = validateImageQuestionPayload(body, { partial: true });
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const updated = await updateImageQuestion(id, body as Partial<NewImageQuestion>);
  return NextResponse.json({ question: updated });
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const { id } = await params;
  const ok = await deleteImageQuestion(id);
  if (!ok) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
