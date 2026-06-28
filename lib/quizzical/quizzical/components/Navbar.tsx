import Link from "next/link";
import Image from "next/image";
import { SparkleIcon } from "./icons";
import NavActions from "./NavActions";
import NavbarAuth from "./NavbarAuth";

const NAV_LINKS = [
  { label: "Browse", href: "/" },
  { label: "Picture games", href: "/#picture-games" },
  { label: "AI Quiz", href: "/ai" },
];

export default function Navbar() {
  return (
    <nav className="relative z-30 w-full print:hidden">
      <div className="custom-container px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="flex h-16 w-full items-center gap-3 border-b border-black/10 md:h-20 md:gap-6">
          {/* Logo */}
          <Link
            href="/"
            className="flex shrink-0 items-center"
            aria-label="Quizzical home"
          >
            <Image
              src="/logo.png"
              alt="Quizzical"
              width={80}
              height={80}
              priority
              className="h-11 w-11 object-contain md:h-14 md:w-14"
            />
          </Link>

          {/* Center nav links */}
          <ul className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="rounded-full px-4 py-2 text-sm font-extrabold text-ink/70 transition-colors hover:bg-black/5 hover:text-ink"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/ai"
              className="hidden h-10 items-center gap-1.5 rounded-full border-2 border-ink bg-grass px-4 text-sm font-extrabold text-white shadow-[0_3px_0_0_#0d0d0d] transition-transform hover:-translate-y-0.5 active:translate-y-0 lg:flex"
            >
              <SparkleIcon className="h-4 w-4 text-sky" />
              AI Generator
            </Link>

            <NavActions />

            <NavbarAuth />
          </div>
        </div>
      </div>
    </nav>
  );
}
