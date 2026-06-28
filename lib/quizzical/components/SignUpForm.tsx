"use client";

import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerkAppearance";

export default function SignUpForm() {
  return (
    <div className="mx-auto w-full max-w-md min-w-0">
      <div className="overflow-hidden rounded-3xl border-4 border-ink bg-white shadow-[0_6px_0_0_#0d0d0d]">
        <div className="border-b-2 border-ink/10 bg-cream/50 px-5 py-6 text-center sm:px-8">
          <h1 className="font-display text-2xl font-extrabold sm:text-3xl">
            Join the fun
          </h1>
          <p className="mt-1 text-sm font-semibold text-ink/60 sm:text-base">
            Pick your player name and start tracking quiz scores.
          </p>
        </div>

        <div className="auth-clerk-shell px-5 py-5 sm:px-8 sm:py-6">
          <SignUp
            appearance={clerkAppearance}
            routing="path"
            path="/signup"
            signInUrl="/signin"
            forceRedirectUrl="/onboarding"
            fallbackRedirectUrl="/onboarding"
          />
        </div>

        <div className="space-y-3 border-t-2 border-ink/10 px-5 py-4 text-center sm:px-8">
          <p className="text-sm font-bold text-ink/60">
            Already have an account?{" "}
            <Link href="/signin" className="text-grass hover:underline">
              Sign in
            </Link>
          </p>
          <Link
            href="/"
            className="inline-block text-xs font-bold text-ink/40 hover:text-ink"
          >
            ← Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
