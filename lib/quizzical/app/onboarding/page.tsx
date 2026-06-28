import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";
import OnboardingForm from "@/components/OnboardingForm";
import {
  AVATAR_COOKIE_NAME,
  ONBOARDING_COOKIE_NAME,
  hasCompletedOnboarding,
} from "@/lib/userMetadata";

export const metadata: Metadata = {
  title: "Set up your profile",
  robots: { index: false, follow: false },
};

export default async function OnboardingPage() {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    redirect("/signup");
  }

  const cookieStore = await cookies();
  if (
    hasCompletedOnboarding(sessionClaims, {
      avatar: cookieStore.get(AVATAR_COOKIE_NAME)?.value,
      onboarded: cookieStore.get(ONBOARDING_COOKIE_NAME)?.value,
    })
  ) {
    redirect("/");
  }

  return (
    <SiteShell showCategories={false} centerContent showFooter={false}>
      <OnboardingForm />
    </SiteShell>
  );
}
