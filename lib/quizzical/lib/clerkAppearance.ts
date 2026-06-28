/** Shared Clerk component appearance — flush inside Quizzical auth shell (no nested card). */
export const clerkAppearance = {
  variables: {
    colorPrimary: "#5b19df",
    colorText: "#0a0a0a",
    colorTextSecondary: "rgba(10, 10, 10, 0.6)",
    colorBackground: "#ffffff",
    colorInputBackground: "#ffffff",
    colorInputText: "#0a0a0a",
    borderRadius: "0.75rem",
    fontFamily: "var(--font-nunito), system-ui, sans-serif",
  },
  elements: {
    rootBox: "w-full max-w-none",
    cardBox: "w-full max-w-none shadow-none",
    card: "w-full max-w-none border-0 bg-transparent p-0 shadow-none",
    main: "w-full max-w-none gap-4",
    header: "hidden",
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    footer: "hidden",
    footerAction: "hidden",
    footerActionLink: "font-bold text-grass",
    footerActionText: "text-sm font-bold text-ink/60",
    socialButtonsBlockButton:
      "rounded-full border-4 border-ink bg-white py-2.5 font-extrabold transition-transform hover:-translate-y-0.5",
    socialButtonsBlockButtonText: "font-extrabold",
    dividerLine: "bg-ink/15",
    dividerText: "text-xs font-bold text-ink/40",
    formFieldLabel: "font-bold text-ink",
    formFieldInput:
      "rounded-xl border-2 border-ink/20 px-3 py-2.5 font-semibold outline-none focus:border-ink",
    formButtonPrimary:
      "rounded-full border-4 border-ink bg-grass py-2.5 font-extrabold text-white shadow-[0_4px_0_0_#0d0d0d] transition-transform hover:-translate-y-0.5",
    identityPreviewEditButton: "font-bold text-grass",
  },
};
