import Link from "next/link";
import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";
import JsonLd from "@/components/JsonLd";
import ContactForm from "@/components/info/ContactForm";
import {
  InfoCard,
  InfoHero,
  InfoProse,
  InfoSection,
} from "@/components/info/InfoPageParts";
import { contactMetadata } from "@/lib/seo";
import { breadcrumbJsonLd } from "@/lib/seoStructuredData";

export const metadata: Metadata = contactMetadata();

const FAQ = [
  {
    q: "How do I report a bug?",
    a: "Email us with steps to reproduce, your browser/device, and a screenshot if possible. We prioritize gameplay-breaking issues.",
  },
  {
    q: "Can I suggest a new quiz category?",
    a: "Absolutely — we love feature ideas. Tell us the topic, difficulty, and whether you'd prefer text or picture quizzes.",
  },
  {
    q: "Do you offer partnerships or sponsorships?",
    a: "Yes. Reach out with your brand, audience, and what you have in mind. We review partnership inquiries regularly.",
  },
  {
    q: "How long until I hear back?",
    a: "We aim to respond within 24–72 business hours. Complex requests may take a little longer.",
  },
];

export default function ContactPage() {
  return (
    <SiteShell showCategories={false}>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Contact", path: "/contact" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "ContactPage",
            name: "Contact Quizzical",
            url: "https://quizzical.site/contact",
          },
        ]}
      />

      <div className="mx-auto flex max-w-4xl flex-col gap-10 pb-4 md:gap-14">
        <InfoHero
          emoji="💬"
          title="Contact Us"
          subtitle="We'd love to hear from you — feedback, feature ideas, bug reports, partnerships, or general questions."
        />

        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <InfoCard className="flex flex-col gap-5">
            <div>
              <h2 className="text-lg font-black text-ink">Get in touch</h2>
              <p className="mt-1 text-sm font-semibold text-ink/60">
                Whether you have feedback, feature suggestions, bug reports,
                partnership inquiries, or general questions, feel free to reach
                out.
              </p>
            </div>

            <div className="rounded-xl border-4 border-ink/15 bg-cream p-4">
              <p className="text-xs font-extrabold uppercase tracking-wide text-ink/50">
                Email
              </p>
              <a
                href="mailto:Sonkebusiness@gmail.com"
                className="mt-1 block text-base font-extrabold text-grass underline-offset-2 hover:underline"
              >
                Sonkebusiness@gmail.com
              </a>
            </div>

            <div className="rounded-xl border-4 border-ink/15 bg-cream p-4">
              <p className="text-xs font-extrabold uppercase tracking-wide text-ink/50">
                Response time
              </p>
              <p className="mt-1 text-sm font-bold text-ink/75">
                We aim to respond within{" "}
                <span className="font-extrabold text-ink">24–72 business hours</span>.
              </p>
            </div>

            <div className="mt-auto flex flex-wrap gap-2 text-xs font-bold text-ink/50">
              <Link href="/about" className="hover:text-ink">
                About →
              </Link>
              <span aria-hidden>·</span>
              <Link href="/status" className="hover:text-ink">
                Platform status →
              </Link>
            </div>
          </InfoCard>

          <InfoCard>
            <h2 className="mb-4 text-lg font-black text-ink">Send a message</h2>
            <ContactForm />
          </InfoCard>
        </div>

        <InfoSection emoji="❓" title="Frequently asked questions">
          <div className="grid gap-3 sm:grid-cols-2">
            {FAQ.map((item) => (
              <InfoCard key={item.q} className="!p-4">
                <h3 className="font-extrabold text-ink">{item.q}</h3>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-ink/65">
                  {item.a}
                </p>
              </InfoCard>
            ))}
          </div>
        </InfoSection>

        <InfoSection emoji="💡" title="We value your feedback">
          <InfoCard>
            <InfoProse>
              <p>
                Quizzical is built for players like you. Every suggestion helps
                us improve categories, fix issues, and ship features that make
                learning more fun. Don&apos;t hesitate to share what you love —
                or what could be better.
              </p>
            </InfoProse>
          </InfoCard>
        </InfoSection>
      </div>


    </SiteShell>
  );
}
