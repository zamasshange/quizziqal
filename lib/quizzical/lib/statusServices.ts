export type ServiceStatus = "operational" | "degraded" | "outage" | "maintenance";

export type PlatformService = {
  id: string;
  name: string;
  description: string;
  status: ServiceStatus;
};

/** Add new services here — the status page renders them automatically. */
export const PLATFORM_SERVICES: PlatformService[] = [
  {
    id: "quiz",
    name: "Quiz Services",
    description: "Text quizzes, picture games, scoring, and gameplay.",
    status: "operational",
  },
  {
    id: "ai",
    name: "AI Services",
    description: "AI quiz generation powered by Google Gemini.",
    status: "operational",
  },
  {
    id: "auth",
    name: "Authentication Services",
    description: "Sign in, sign up, and account management via Clerk.",
    status: "operational",
  },
  {
    id: "leaderboards",
    name: "Leaderboards",
    description: "Scores, achievements, and player progress tracking.",
    status: "operational",
  },
  {
    id: "media",
    name: "Media & Content Services",
    description: "Wikipedia images, TMDB movie assets, and sports data.",
    status: "operational",
  },
];

const STATUS_LABEL: Record<ServiceStatus, string> = {
  operational: "Operational",
  degraded: "Degraded Performance",
  outage: "Outage",
  maintenance: "Maintenance",
};

const STATUS_DOT: Record<ServiceStatus, string> = {
  operational: "bg-answer4",
  degraded: "bg-answer3",
  outage: "bg-answer1",
  maintenance: "bg-answer2",
};

export function getServiceStatusLabel(status: ServiceStatus): string {
  return STATUS_LABEL[status];
}

export function getServiceStatusDotClass(status: ServiceStatus): string {
  return STATUS_DOT[status];
}

export function getOverallStatus(
  services: PlatformService[] = PLATFORM_SERVICES,
): ServiceStatus {
  if (services.some((s) => s.status === "outage")) return "outage";
  if (services.some((s) => s.status === "degraded")) return "degraded";
  if (services.some((s) => s.status === "maintenance")) return "maintenance";
  return "operational";
}

export function getOverallStatusLabel(
  services: PlatformService[] = PLATFORM_SERVICES,
): string {
  return STATUS_LABEL[getOverallStatus(services)];
}
