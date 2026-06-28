"use client";

import { useEffect } from "react";
import { useAtmosphere } from "@/lib/atmosphere/context";

/** Sets ambient theme category while a quiz or category view is active. */
export function useAtmosphereCategory(categorySlug?: string) {
  const { setCategorySlug } = useAtmosphere();

  useEffect(() => {
    setCategorySlug(categorySlug);
    return () => setCategorySlug(undefined);
  }, [categorySlug, setCategorySlug]);
}
