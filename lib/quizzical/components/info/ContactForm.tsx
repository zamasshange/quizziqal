"use client";

import { useState } from "react";
import { playClick } from "@/lib/sound";

const CONTACT_EMAIL = "Sonkebusiness@gmail.com";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    playClick();

    const body = [
      message.trim(),
      "",
      `— ${name.trim() || "Anonymous"}`,
      email.trim() ? `Reply to: ${email.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      subject.trim() || "Quizzical contact",
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="contact-name" className="text-sm font-extrabold text-ink">
            Name
          </label>
          <input
            id="contact-name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="rounded-xl border-4 border-ink/20 bg-cream px-4 py-2.5 font-bold text-ink placeholder:text-ink/30 focus:border-ink focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="contact-email" className="text-sm font-extrabold text-ink">
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="rounded-xl border-4 border-ink/20 bg-cream px-4 py-2.5 font-bold text-ink placeholder:text-ink/30 focus:border-ink focus:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-subject" className="text-sm font-extrabold text-ink">
          Subject
        </label>
        <input
          id="contact-subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Feedback, bug report, partnership…"
          className="rounded-xl border-4 border-ink/20 bg-cream px-4 py-2.5 font-bold text-ink placeholder:text-ink/30 focus:border-ink focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-message" className="text-sm font-extrabold text-ink">
          Message
        </label>
        <textarea
          id="contact-message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us what's on your mind…"
          className="resize-y rounded-xl border-4 border-ink/20 bg-cream px-4 py-2.5 font-bold text-ink placeholder:text-ink/30 focus:border-ink focus:outline-none"
        />
      </div>

      <button
        type="submit"
        className="self-start rounded-full border-4 border-ink bg-grass px-6 py-3 font-extrabold text-white shadow-[0_4px_0_0_#0d0d0d] transition-transform hover:-translate-y-0.5"
      >
        Open in email app →
      </button>
      <p className="text-xs font-semibold text-ink/50">
        Opens your default email client with your message pre-filled. Full
        in-app sending coming soon.
      </p>
    </form>
  );
}
