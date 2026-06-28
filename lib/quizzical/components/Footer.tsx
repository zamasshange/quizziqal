import Link from "next/link";

const COMPANY_LINKS = [
  { href: "/about", label: "About" },
  { href: "/founder", label: "Founder" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/contact", label: "Contact" },
  { href: "/status", label: "Status" },
];

const RESOURCE_LINKS = [
  { href: "/discover", label: "Discover" },
  { href: "/topics", label: "Topics" },
  { href: "/ai", label: "AI Quiz Generator" },
  { href: "/knowledge-book", label: "Knowledge Book" },
  { href: "/#picture-games", label: "Picture games" },
];

export default function Footer() {
  return (
    <footer className="custom-container px-4 py-10 sm:px-6 md:px-8 lg:px-12">
      <div className="grid gap-8 border-t-4 border-ink/10 pt-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-sm font-black text-ink">Quizzical</p>
          <p className="mt-2 text-xs font-semibold leading-relaxed text-ink/55">
            Free AI-powered quiz games by BDL Corp — learn something new after
            every answer.
          </p>
          <div className="mt-3 flex flex-wrap gap-x-2 gap-y-1 text-xs font-bold text-ink/40">
            <span>BDL Corp</span>
            <span aria-hidden>·</span>
            <span>Sonke AI</span>
            <span aria-hidden>·</span>
            <span>Zama Shange</span>
            <span aria-hidden>·</span>
            <span>Burdolar</span>
          </div>
        </div>

        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-ink/45">
            Company
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            {COMPANY_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm font-bold text-ink/60 transition-colors hover:text-ink"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-ink/45">
            Play
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            {RESOURCE_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm font-bold text-ink/60 transition-colors hover:text-ink"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-ink/45">
            Account
          </p>
          <ul className="mt-3 flex flex-col gap-2">
          <li>
            <Link
              href="/profile"
              className="text-sm font-bold text-ink/60 transition-colors hover:text-ink"
            >
              My Games
            </Link>
          </li>
          <li>
            <Link
              href="/leaderboard"
              className="text-sm font-bold text-ink/60 transition-colors hover:text-ink"
            >
              Leaderboard
            </Link>
          </li>
          <li>
            <Link
              href="/signup"
              className="text-sm font-bold text-ink/60 transition-colors hover:text-ink"
            >
              Sign Up
            </Link>
          </li>
            <li>
              <Link
                href="/signin"
                className="text-sm font-bold text-ink/60 transition-colors hover:text-ink"
              >
                Sign In
              </Link>
            </li>
          </ul>
          <a
            href="https://www.youtube.com/@quizziqal"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1 rounded-full border-2 border-ink bg-white px-3 py-1 text-xs font-extrabold text-ink shadow-[0_2px_0_0_#0d0d0d] transition-transform hover:-translate-y-0.5"
          >
            <span aria-hidden>▶</span>
            YouTube
          </a>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-ink/10 pt-6 text-xs font-bold text-ink/45">
        <span>© {new Date().getFullYear()} BDL Corp</span>
        <span aria-hidden>•</span>
        <span>Quizzical — a BDL Corp game by Zama Shange &amp; Sonke AI</span>
      </div>
    </footer>
  );
}
