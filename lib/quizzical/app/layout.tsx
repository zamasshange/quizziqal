import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Nunito, Baloo_2 } from "next/font/google";
import "./globals.css";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/seo";
import { BASE_KEYWORDS, BRAND_KEYWORDS } from "@/lib/seoKeywords";
import { AtmosphereProvider } from "@/lib/atmosphere/context";
import ProgressionLayer from "@/components/ProgressionLayer";

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
    default: "Quizzical | Play Free AI-Powered Quiz Games Online",
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Challenge yourself with hundreds of quiz games covering geography, sports, movies, history, science, music, and more. Learn, compete, and become a Knowledge Explorer.",
  applicationName: SITE_NAME,
  keywords: [...BASE_KEYWORDS, ...BRAND_KEYWORDS],
  authors: [{ name: "BDL Corp", url: SITE_URL }],
  creator: "BDL Corp",
  publisher: "BDL Corp",
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Quizzical | Play Free AI-Powered Quiz Games Online",
    description:
      "Challenge yourself with hundreds of quiz games covering geography, sports, movies, history, science, and more. Learn, compete, and become a Knowledge Explorer.",
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
    title: "Quizzical | Free AI-Powered Quiz Games",
    description:
      "Play free quiz games online — geography, sports, movies, trivia, and AI-powered challenges on Quizzical.",
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
      className={`${nunito.variable} ${baloo.variable} antialiased`}
    >
      <body className="overflow-x-hidden">
        <ClerkProvider signInUrl="/signin" signUpUrl="/signup">
          <AtmosphereProvider>
            {children}
            <ProgressionLayer />
          </AtmosphereProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
