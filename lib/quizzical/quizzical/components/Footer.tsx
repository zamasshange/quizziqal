import Link from "next/link";

export default function Footer() {
  return (
    <footer className="custom-container px-4 py-8 sm:px-6 md:px-8 lg:px-12">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-bold text-ink/50">
        <span>© {new Date().getFullYear()} BDL Corp</span>
        <span aria-hidden>•</span>
        <Link href="/" className="hover:text-ink">
          Contact
        </Link>
        <span aria-hidden>•</span>
        <Link href="/" className="hover:text-ink">
          Terms &amp; Privacy
        </Link>
        <span aria-hidden>•</span>
        <Link href="/" className="hover:text-ink">
          Status
        </Link>
        <span aria-hidden>•</span>
        <a
          href="https://www.youtube.com/@quizziqal"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-full border-2 border-ink bg-white px-2.5 py-0.5 font-extrabold text-ink shadow-[0_2px_0_0_#0d0d0d] transition-transform hover:-translate-y-0.5 hover:text-ink"
        >
          <span aria-hidden>▶</span>
          YouTube
        </a>
        <span className="ml-auto">Quizzical — a BDL Corp game</span>
      </div>
    </footer>
  );
}
