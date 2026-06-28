import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";
import JsonLd from "@/components/JsonLd";
import { InfoCard, InfoHero, InfoSection } from "@/components/info/InfoPageParts";
import { statusMetadata } from "@/lib/seo";
import { breadcrumbJsonLd } from "@/lib/seoStructuredData";
import {
  getOverallStatus,
  getOverallStatusLabel,
  getServiceStatusDotClass,
  getServiceStatusLabel,
  PLATFORM_SERVICES,
  type ServiceStatus,
} from "@/lib/statusServices";

export const metadata: Metadata = statusMetadata();

function formatTimestamp(): string {
  return new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const OVERALL_BANNER: Record<
  ServiceStatus,
  { bg: string; border: string; text: string }
> = {
  operational: {
    bg: "bg-answer4/15",
    border: "border-answer4",
    text: "text-answer4",
  },
  degraded: {
    bg: "bg-answer3/15",
    border: "border-answer3",
    text: "text-ink",
  },
  outage: {
    bg: "bg-answer1/15",
    border: "border-answer1",
    text: "text-answer1",
  },
  maintenance: {
    bg: "bg-answer2/15",
    border: "border-answer2",
    text: "text-answer2",
  },
};

export default function StatusPage() {
  const lastUpdated = formatTimestamp();
  const overall = getOverallStatus();
  const banner = OVERALL_BANNER[overall];

  return (
    <SiteShell showCategories={false}>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Platform Status", path: "/status" },
        ])}
      />

      <div className="mx-auto flex max-w-3xl flex-col gap-8 pb-4 md:gap-10">
        <InfoHero
          emoji="📡"
          title="Platform Status"
          subtitle="Real-time overview of Quizzical service health."
          accentClass="bg-petrol"
        />

        <div
          className={`flex items-center gap-3 rounded-2xl border-4 ${banner.border} ${banner.bg} px-5 py-4 shadow-[0_4px_0_0_#0d0d0d]`}
          role="status"
          aria-live="polite"
        >
          <span
            className={`relative flex h-4 w-4 shrink-0 rounded-full ${getServiceStatusDotClass(overall)}`}
            aria-hidden
          >
            <span
              className={`absolute inset-0 animate-ping rounded-full opacity-40 ${getServiceStatusDotClass(overall)}`}
            />
          </span>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-ink/50">
              Current status
            </p>
            <p className={`text-xl font-black ${banner.text}`}>
              {getOverallStatusLabel()}
            </p>
          </div>
          <p className="ml-auto hidden text-xs font-bold text-ink/45 sm:block">
            Updated {lastUpdated}
          </p>
        </div>

        <p className="text-xs font-bold text-ink/45 sm:hidden">
          Last updated: {lastUpdated}
        </p>

        <InfoSection title="Services">
          <ul className="flex flex-col gap-3">
            {PLATFORM_SERVICES.map((service) => (
              <li key={service.id}>
                <InfoCard className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-extrabold text-ink">{service.name}</h3>
                    <p className="mt-0.5 text-sm font-semibold text-ink/55">
                      {service.description}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 self-start sm:self-center">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${getServiceStatusDotClass(service.status)}`}
                      aria-hidden
                    />
                    <span className="text-sm font-extrabold text-ink/80">
                      {getServiceStatusLabel(service.status)}
                    </span>
                  </div>
                </InfoCard>
              </li>
            ))}
          </ul>
        </InfoSection>

        <InfoCard className="text-center">
          <p className="text-sm font-semibold text-ink/60">
            Experiencing an issue not listed here?{" "}
            <a
              href="/contact"
              className="font-extrabold text-grass underline-offset-2 hover:underline"
            >
              Contact support
            </a>
            .
          </p>
        </InfoCard>
      </div>


    </SiteShell>
  );
}
