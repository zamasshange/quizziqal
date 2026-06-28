/** Fire-and-forget sync of played content to server history (signed-in users). */
export async function syncContentHistory(body: {
  category?: string;
  answers?: string[];
  items?: { contentId: string; contentType?: string; category?: string }[];
}): Promise<void> {
  try {
    await fetch("/api/content/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    /* guest or offline */
  }
}
