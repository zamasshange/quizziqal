import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Nunito, Baloo_2 } from "next/font/google";
import "./globals.css";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/seo";
import { BASE_KEYWORDS } from "@/lib/seoKeywords";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Free Online Quiz Games & Trivia`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Play free quiz games online at Quizzical.site — geography, movies, sports, flags, picture quizzes, and AI trivia. Learn something new after every answer.",
  applicationName: SITE_NAME,
  keywords: BASE_KEYWORDS,
  authors: [{ name: "BDL Corp", url: SITE_URL }],
  creator: "BDL Corp",
  publisher: "BDL Corp",
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Free Online Quiz Games & Trivia`,
    description:
      "Play free quiz games online — geography, movies, sports, flags, celebrities, and AI-generated trivia.",
    images: [
      {
        url: absoluteUrl("/logo.png"),
        width: 512,
        height: 512,
        alt: `${SITE_NAME} logo`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Free Online Quiz Games`,
    description: "Free online trivia and picture quiz games at Quizzical.site.",
    images: [absoluteUrl("/logo.png")],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: SITE_URL },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      translate="no"
      className={`${nunito.variable} ${baloo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden">
        <ClerkProvider signInUrl="/signin" signUpUrl="/signin">
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
