import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";
import AccountSettingsForm from "@/components/AccountSettingsForm";

export const metadata: Metadata = {
  title: "Manage account",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/signin");
  }

  return (
    <SiteShell showCategories={false} centerContent>
      <AccountSettingsForm />
    </SiteShell>
  );
}
