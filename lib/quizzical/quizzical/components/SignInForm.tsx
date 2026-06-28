"use client";

import Link from "next/link";
import { SignIn } from "@clerk/nextjs";

const clerkAppearance = {
  variables: {
    colorPrimary: "#5b19df",
    colorText: "#0a0a0a",
    colorTextSecondary: "rgba(10, 10, 10, 0.6)",
    colorBackground: "#ffffff",
    colorInputBackground: "#ffffff",
    colorInputText: "#0a0a0a",
    borderRadius: "0.75rem",
    fontFamily: "var(--font-nunito), system-ui, sans-serif",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "w-full shadow-none",
    card: "border-0 bg-transparent p-0 shadow-none",
    header: "hidden",
    headerTitle: "font-display text-3xl font-extrabold",
    headerSubtitle: "font-semibold text-ink/60",
    socialButtonsBlockButton:
      "rounded-full border-4 border-ink bg-white py-2.5 font-extrabold transition-transform hover:-translate-y-0.5",
    socialButtonsBlockButtonText: "font-extrabold",
    dividerLine: "bg-ink/15",
    dividerText: "text-xs font-bold text-ink/40",
    formFieldInput:
      "rounded-xl border-2 border-ink/20 px-3 py-2.5 font-semibold outline-none focus:border-ink",
    formButtonPrimary:
      "rounded-full border-4 border-ink bg-grass py-2.5 font-extrabold text-white shadow-[0_4px_0_0_#0d0d0d] transition-transform hover:-translate-y-0.5",
    footerActionLink: "font-bold text-grass",
    footerActionText: "text-sm font-bold text-ink/60",
    identityPreviewEditButton: "font-bold text-grass",
  },
};

export default function SignInForm() {
  return (
    <div className="mx-auto mt-6 flex max-w-md flex-col gap-5 rounded-3xl border-4 border-ink bg-white p-6 shadow-[0_6px_0_0_#0d0d0d] md:p-8">
      <div className="text-center">
        <h1 className="font-display text-3xl font-extrabold">Welcome back</h1>
        <p className="mt-1 font-semibold text-ink/60">
          Sign in to track your quiz scores and manage admin content.
        </p>
      </div>

      <SignIn
        appearance={clerkAppearance}
        routing="path"
        path="/signin"
        signUpUrl="/signin"
        forceRedirectUrl="/"
        fallbackRedirectUrl="/"
      />

      <Link
        href="/"
        className="text-center text-xs font-bold text-ink/40 hover:text-ink"
      >
        ← Back home
      </Link>
    </div>
  );
}
