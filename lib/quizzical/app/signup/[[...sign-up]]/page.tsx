import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";
import SignUpForm from "@/components/SignUpForm";
import { signUpMetadata } from "@/lib/seo";

export const metadata: Metadata = signUpMetadata();

export default function SignUpPage() {
  return (
    <SiteShell showCategories={false} centerContent showFooter={false}>
      <SignUpForm />
    </SiteShell>
  );
}
