import Link from "next/link";
import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";
import JsonLd from "@/components/JsonLd";
import {
  InfoCard,
  InfoHero,
  InfoList,
  InfoProse,
  InfoSection,
} from "@/components/info/InfoPageParts";
import { privacyPolicyMetadata } from "@/lib/seo";
import { breadcrumbJsonLd } from "@/lib/seoStructuredData";

export const metadata: Metadata = privacyPolicyMetadata();

function formatLastUpdated(): string {
  return new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function PrivacyPolicyPage() {
  const lastUpdated = formatLastUpdated();

  return (
    <SiteShell showCategories={false}>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Privacy Policy", path: "/privacy-policy" },
        ])}
      />

      <div className="mx-auto flex max-w-3xl flex-col gap-10 pb-4 md:gap-12">
        <InfoHero
          emoji="🔒"
          title="Privacy Policy"
          subtitle="Your privacy is important to us. This policy explains what we collect, how we use it, and your rights."
          accentClass="bg-ink"
        >
          <p className="mt-4 text-sm font-bold text-cream/60">
            Last updated: {lastUpdated}
          </p>
        </InfoHero>

        <InfoProse>
          <p>
            We collect only the information necessary to provide and improve our
            services. This may include account information, quiz progress,
            scores, and usage data.
          </p>
        </InfoProse>

        <InfoSection id="collection" emoji="📋" title="Information we collect">
          <InfoCard>
            <InfoList
              items={[
                "Account details (if you create an account)",
                "Quiz results and statistics",
                "Device and browser information",
                "Anonymous analytics data",
              ]}
            />
          </InfoCard>
        </InfoSection>

        <InfoSection id="usage" emoji="⚙️" title="How we use information">
          <InfoCard>
            <InfoList
              items={[
                "To provide and improve our services",
                "To personalize experiences",
                "To maintain leaderboards and achievements",
                "To improve security and platform performance",
              ]}
            />
          </InfoCard>
        </InfoSection>

        <InfoSection id="sharing" emoji="🤝" title="We do not sell personal information">
          <InfoCard>
            <InfoProse>
              <p>
                Quizzical does not sell, rent, or trade your personal
                information to third parties for marketing purposes.
              </p>
            </InfoProse>
          </InfoCard>
        </InfoSection>

        <InfoSection id="third-party" emoji="🔗" title="Third-party services">
          <InfoCard>
            <InfoProse>
              <p>
                We may use trusted third-party services to operate the
                platform, including:
              </p>
            </InfoProse>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {[
                "Supabase",
                "Clerk",
                "Google Gemini",
                "Wikipedia",
                "TheSportsDB",
                "TMDB",
              ].map((service) => (
                <li
                  key={service}
                  className="rounded-xl border-2 border-ink/10 bg-cream px-3 py-2 text-sm font-extrabold text-ink/80"
                >
                  {service}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm font-semibold text-ink/60">
              Each provider has its own privacy policy governing how they handle
              data on our behalf.
            </p>
          </InfoCard>
        </InfoSection>

        <InfoSection id="protection" emoji="🛡️" title="Data protection">
          <InfoCard>
            <InfoProse>
              <p>
                We implement industry-standard security measures to protect your
                data, including encrypted connections (HTTPS), secure
                authentication, and access controls on our infrastructure.
              </p>
              <p>
                While no system is completely immune to risk, we continuously
                review and improve our security practices to keep your
                information safe.
              </p>
            </InfoProse>
          </InfoCard>
        </InfoSection>

        <InfoSection id="cookies" emoji="🍪" title="Cookies">
          <InfoCard>
            <InfoProse>
              <p>
                We use cookies and similar technologies to keep you signed in,
                remember preferences (such as your avatar), and understand how
                the platform is used.
              </p>
              <p>
                Essential cookies are required for core functionality. Analytics
                cookies help us improve the experience and may be anonymized.
                You can control cookies through your browser settings.
              </p>
            </InfoProse>
          </InfoCard>
        </InfoSection>

        <InfoSection id="rights" emoji="✅" title="Your rights">
          <InfoCard>
            <InfoList
              items={[
                "Access the personal data we hold about you",
                "Request correction of inaccurate information",
                "Request deletion of your account and associated data",
                "Opt out of non-essential communications",
                "Withdraw consent where processing is consent-based",
              ]}
            />
          </InfoCard>
        </InfoSection>

        <InfoSection id="contact" emoji="📧" title="Contact us">
          <InfoCard>
            <InfoProse>
              <p>
                For privacy-related questions or to exercise your rights, contact
                us at{" "}
                <a
                  href="mailto:Sonkebusiness@gmail.com"
                  className="font-extrabold text-grass underline-offset-2 hover:underline"
                >
                  Sonkebusiness@gmail.com
                </a>
                .
              </p>
              <p>
                See also our{" "}
                <Link
                  href="/contact"
                  className="font-extrabold text-grass underline-offset-2 hover:underline"
                >
                  Contact page
                </Link>{" "}
                for general inquiries.
              </p>
            </InfoProse>
          </InfoCard>
        </InfoSection>
      </div>


    </SiteShell>
  );
}
