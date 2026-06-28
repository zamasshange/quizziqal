import type { Metadata } from "next";
import KnowledgeBookClient from "@/components/progression/KnowledgeBookClient";

export const metadata: Metadata = {
  title: "My Knowledge Book",
  description: "Browse everything you have discovered while playing Quizzical.",
  robots: { index: false, follow: false },
};

export default function KnowledgeBookPage() {
  return <KnowledgeBookClient />;
}
