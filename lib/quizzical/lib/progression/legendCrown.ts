import { getSupabaseAdmin } from "@/lib/supabase";
import { emitActivityEvent } from "@/lib/platform/activity";
import { buildFullProgressionState } from "./buildState";
import type { RawState } from "./engine";

export type CrownResult = {
  crowned: boolean;
  legendNumber?: number;
};

/** Crown a user as Knowledge Legend when all requirements are met. */
export async function tryCrownKnowledgeLegend(
  userId: string,
  username: string,
  countryCode: string,
  avatarId: string | null,
  raw: RawState,
): Promise<CrownResult> {
  if (raw.isLegend) return { crowned: false };

  const state = buildFullProgressionState(raw);
  if (!state.legend?.eligible) return { crowned: false };

  const sb = getSupabaseAdmin();
  let legendNumber = 1;

  if (sb) {
    const { count } = await sb
      .from("knowledge_legend_status")
      .select("*", { count: "exact", head: true })
      .eq("is_legend", true);
    legendNumber = (count ?? 0) + 1;
  }

  const crownedAt = new Date().toISOString();
  raw.isLegend = true;
  raw.legendNumber = legendNumber;
  raw.crownedAt = crownedAt;

  if (!sb) return { crowned: true, legendNumber };

  const { data: hof } = await sb
    .from("hall_of_fame")
    .insert({
      entry_kind: "knowledge_legend",
      title: `Knowledge Legend #${legendNumber}`,
      username,
      user_id: userId,
      country_code: countryCode,
      emoji: "👑",
      detail: "Achieved the highest honour in Quizzical history.",
    })
    .select("id")
    .single();

  await sb.from("knowledge_legend_status").upsert({
    user_id: userId,
    is_legend: true,
    legend_number: legendNumber,
    crowned_at: crownedAt,
    requirements_met: state.legend.requirements,
    profile_frame: "legend-gold",
    profile_theme: "legend",
    hall_of_fame_entry_id: hof?.id ?? null,
  });

  await emitActivityEvent({
    userId,
    username,
    avatarId,
    countryCode,
    eventKind: "knowledge_legend",
    message: `👑 ${username} became Knowledge Legend #${legendNumber}`,
    emoji: "👑",
  });

  return { crowned: true, legendNumber };
}
