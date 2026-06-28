"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

type AtmosphereContextValue = {
  categorySlug?: string;
  setCategorySlug: (slug?: string) => void;
  particlesEnabled: boolean;
  setParticlesEnabled: (v: boolean) => void;
};

const AtmosphereContext = createContext<AtmosphereContextValue | null>(null);

export function AtmosphereProvider({ children }: { children: ReactNode }) {
  const [categorySlug, setCategorySlugState] = useState<string | undefined>();
  const [particlesEnabled, setParticlesEnabled] = useState(true);

  const setCategorySlug = useCallback((slug?: string) => {
    setCategorySlugState(slug);
  }, []);

  const value = useMemo(
    () => ({
      categorySlug,
      setCategorySlug,
      particlesEnabled,
      setParticlesEnabled,
    }),
    [categorySlug, setCategorySlug, particlesEnabled],
  );

  return (
    <ParticlesProvider init={loadSlim}>
      <AtmosphereContext.Provider value={value}>{children}</AtmosphereContext.Provider>
    </ParticlesProvider>
  );
}

export function useAtmosphere() {
  const ctx = useContext(AtmosphereContext);
  if (!ctx) {
    throw new Error("useAtmosphere must be used within AtmosphereProvider");
  }
  return ctx;
}

/** Safe hook when provider may be absent (SSR edge cases). */
export function useAtmosphereOptional() {
  return useContext(AtmosphereContext);
}
