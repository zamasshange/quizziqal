"use client";

import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerkAppearance";

export default function SignInForm() {
  return (
    <div className="mx-auto w-full max-w-md min-w-0">
      <div className="overflow-hidden rounded-3xl border-4 border-ink bg-white shadow-[0_6px_0_0_#0d0d0d]">
        <div className="border-b-2 border-ink/10 bg-cream/50 px-5 py-6 text-center sm:px-8">
          <h1 className="font-display text-2xl font-extrabold sm:text-3xl">
            Welcome back
          </h1>
          <p className="mt-1 text-sm font-semibold text-ink/60 sm:text-base">
            Sign in with your username to track scores and manage admin content.
          </p>
        </div>

        <div className="auth-clerk-shell px-5 py-5 sm:px-8 sm:py-6">
          <SignIn
            appearance={clerkAppearance}
            routing="path"
            path="/signin"
            signUpUrl="/signup"
            forceRedirectUrl="/"
            fallbackRedirectUrl="/"
          />
        </div>

        <div className="space-y-3 border-t-2 border-ink/10 px-5 py-4 text-center sm:px-8">
          <p className="text-sm font-bold text-ink/60">
            New here?{" "}
            <Link href="/signup" className="text-grass hover:underline">
              Create an account
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
