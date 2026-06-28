import Link from "next/link";
import Image from "next/image";
import { SparkleIcon } from "./icons";
import NavActions from "./NavActions";
import NavbarAuth from "./NavbarAuth";
import NavbarLinks from "./NavbarLinks";

export default function Navbar() {
  return (
    <nav className="relative z-30 w-full print:hidden">
      <div className="custom-container px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="flex h-16 w-full items-center gap-2 border-b border-black/10 md:h-[4.5rem] md:gap-4">
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

          {/* Center nav links — visible from sm up; Sign In always in NavbarAuth on mobile */}
          <NavbarLinks />

          {/* Right actions */}
          <div className="ml-auto flex shrink-0 items-center gap-1.5 md:gap-2">
            <Link
              href="/ai"
              className="hidden h-9 items-center gap-1.5 rounded-full border-2 border-ink bg-grass px-3 text-xs font-extrabold text-white shadow-[0_3px_0_0_#0d0d0d] transition-transform hover:-translate-y-0.5 active:translate-y-0 md:h-10 md:px-4 md:text-sm xl:flex"
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
