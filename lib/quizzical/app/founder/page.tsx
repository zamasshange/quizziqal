import Link from "next/link";
import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";
import JsonLd from "@/components/JsonLd";
import {
  InfoCard,
  InfoHero,
  InfoProse,
  InfoSection,
} from "@/components/info/InfoPageParts";
import { founderMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, personJsonLd } from "@/lib/seoStructuredData";

export const metadata: Metadata = founderMetadata();

const TIMELINE = [
  {
    year: "2007",
    title: "Born in Durban",
    description:
      "Zama Shange was born on 20 June 2007 in Durban, South Africa — the start of a journey in creativity and technology.",
  },
  {
    year: "Early years",
    title: "Move to Johannesburg",
    description:
      "Relocated to Johannesburg at a young age, where his passion for technology, design, and digital creation began to take shape.",
  },
  {
    year: "~2018",
    title: "Digital exploration",
    description:
      "By age eleven, developed a strong interest in computers, design, and software — spending countless hours learning digital tools.",
  },
  {
    year: "2020",
    title: "Founded BDL Corp",
    description:
      "Launched BDL Corp (Burdolar) — a creative initiative focused on digital marketing, social media, videography, editing, and software development.",
  },
  {
    year: "2020+",
    title: "BDL News",
    description:
      "Notable project: BDL News, a digital media platform focused on news and broadcasting.",
  },
  {
    year: "Today",
    title: "Building Quizzical",
    description:
      "Continues to build innovative digital products combining technology, creativity, and education — including this AI-powered quiz platform.",
  },
];

const FIELDS = [
  "Software Development",
  "Product Design",
  "UI/UX Design",
  "Branding",
  "Digital Media",
  "Product Engineering",
];

export default function FounderPage() {
  return (
    <SiteShell showCategories={false}>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Founder", path: "/founder" },
          ]),
          personJsonLd(),
        ]}
      />

      <div className="mx-auto flex max-w-4xl flex-col gap-10 pb-4 md:gap-14">
        <InfoHero
          emoji="🚀"
          title="About Zama Shange"
          subtitle="South African founder, designer, developer, and creative builder — connecting people through technology and innovation."
        />

        {/* Profile card */}
        <div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-start">
          <div
            className="mx-auto flex h-40 w-40 flex-col items-center justify-center rounded-3xl border-4 border-ink bg-gradient-to-br from-petrol to-grass shadow-[0_6px_0_0_#0d0d0d] md:mx-0"
            role="img"
            aria-label="Portrait placeholder for Zama Shange"
          >
            <span className="font-display text-5xl font-black text-cream">ZS</span>
            <span className="mt-1 text-xs font-bold text-cream/60">Founder</span>
          </div>

          <InfoCard>
            <InfoProse>
              <p>
                Zama Shange is a South African founder, designer, developer, and
                creative builder dedicated to creating digital products, brands,
                and experiences that connect people through technology and
                innovation.
              </p>
              <p>
                Born on 20 June 2007 in Durban, South Africa, Zama moved to
                Johannesburg at a young age, where his passion for technology,
                design, and digital creation began to take shape.
              </p>
              <p>
                By the age of eleven, he had already developed a strong interest
                in computers, design, and software development, spending countless
                hours learning and experimenting with digital tools and creative
                projects.
              </p>
            </InfoProse>
          </InfoCard>
        </div>

        <InfoSection emoji="📅" title="Timeline">
          <ol className="relative border-l-4 border-ink/15 pl-6">
            {TIMELINE.map((item, i) => (
              <li key={item.year + item.title} className={`relative ${i > 0 ? "mt-8" : ""}`}>
                <span
                  className="absolute -left-[calc(1.5rem+2px)] top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-ink bg-grass"
                  aria-hidden
                />
                <p className="text-xs font-extrabold uppercase tracking-wide text-grass">
                  {item.year}
                </p>
                <h3 className="mt-0.5 font-extrabold text-ink">{item.title}</h3>
                <p className="mt-1 text-sm font-semibold leading-relaxed text-ink/65">
                  {item.description}
                </p>
              </li>
            ))}
          </ol>
        </InfoSection>

        <InfoSection emoji="🏢" title="BDL Corp &amp; beyond">
          <InfoCard>
            <InfoProse>
              <p>
                Around 2020, he founded{" "}
                <span className="font-extrabold text-ink">BDL Corp (Burdolar)</span>
                , a creative initiative focused on digital marketing, social media
                strategy, videography, editing, and software development.
              </p>
              <p>
                One of the notable projects launched during this period was{" "}
                <span className="font-extrabold text-ink">BDL News</span>, a digital
                media platform focused on news and broadcasting.
              </p>
              <p>
                Today, Zama continues to build innovative digital products and
                platforms that combine technology, creativity, and education.
              </p>
            </InfoProse>
            <div className="mt-5 flex flex-wrap gap-2">
              {FIELDS.map((field) => (
                <span
                  key={field}
                  className="rounded-full border-2 border-ink/15 bg-cream px-3 py-1 text-xs font-extrabold text-ink/75"
                >
                  {field}
                </span>
              ))}
            </div>
          </InfoCard>
        </InfoSection>

        <InfoSection emoji="🔭" title="Vision">
          <InfoCard className="border-grass bg-gradient-to-br from-white to-cream">
            <InfoProse>
              <p>
                Through this quiz platform, Zama&apos;s vision is to make learning
                more engaging, interactive, and enjoyable by combining artificial
                intelligence, trusted information sources, and modern game design.
              </p>
            </InfoProse>
          </InfoCard>
        </InfoSection>

        <InfoSection emoji="💭" title="Philosophy">
          <blockquote className="rounded-2xl border-4 border-ink bg-lime px-6 py-8 shadow-[0_4px_0_0_#0d0d0d]">
            <p className="font-display text-xl font-black leading-snug text-ink md:text-2xl">
              &ldquo;Build systems that educate, inspire, and create opportunities
              for people to grow.&rdquo;
            </p>
            <footer className="mt-4 text-sm font-extrabold text-ink/60">
              — Zama Shange
            </footer>
          </blockquote>
        </InfoSection>

        <InfoSection emoji="📌" title="Quick facts">
          <InfoCard>
            <dl className="grid gap-4 sm:grid-cols-2">
              {[
                ["Name", "Zama Shange"],
                ["Born", "20 June 2007"],
                ["Birthplace", "Durban, South Africa"],
                ["Based in", "Johannesburg, South Africa"],
                [
                  "Fields",
                  "Software Development, Product Design, UI/UX, Branding, Digital Media",
                ],
                [
                  "Known for",
                  "BDL Corp, BDL News, Sonke AI, Quizzical, and various digital products",
                ],
              ].map(([term, value]) => (
                <div key={term}>
                  <dt className="text-xs font-extrabold uppercase tracking-wide text-ink/45">
                    {term}
                  </dt>
                  <dd className="mt-1 text-sm font-bold text-ink/80">{value}</dd>
                </div>
              ))}
            </dl>
          </InfoCard>
        </InfoSection>

        <InfoCard className="text-center">
          <p className="font-extrabold text-ink">
            Explore the platform Zama built
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-3">
            <Link
              href="/about"
              className="rounded-full border-2 border-ink bg-white px-4 py-2 text-sm font-extrabold shadow-[0_2px_0_0_#0d0d0d] transition-transform hover:-translate-y-0.5"
            >
              About Quizzical
            </Link>
            <Link
              href="/"
              className="rounded-full border-2 border-ink bg-grass px-4 py-2 text-sm font-extrabold text-white shadow-[0_2px_0_0_#0d0d0d] transition-transform hover:-translate-y-0.5"
            >
              Play now
            </Link>
          </div>
        </InfoCard>
      </div>


    </SiteShell>
  );
}
