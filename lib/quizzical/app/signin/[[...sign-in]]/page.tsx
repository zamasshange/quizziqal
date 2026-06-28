import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";
import SignInForm from "@/components/SignInForm";
import { signInMetadata } from "@/lib/seo";

export const metadata: Metadata = signInMetadata();

export default function SignInPage() {
  return (
    <SiteShell showCategories={false} centerContent showFooter={false}>
      <SignInForm />
    </SiteShell>
  );
}
