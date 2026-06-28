// TheSportsDB — primary data source for sports reveals (players + teams).
// Docs: https://www.thesportsdb.com/api.php
//
// Uses the free/test key "3" by default; set SPORTSDB_KEY for a Patreon key
// (needed for the honours/former-teams endpoints). Every call fails soft: any
// network/parse error returns null so the reveal engine can fall back to
// Wikipedia. Results are cached upstream by the reveal orchestrator (Supabase).

import { flagEmoji } from "./reveal/flags";
import type { PlayerReveal, TeamReveal } from "./reveal/types";

const KEY = process.env.SPORTSDB_KEY ?? "3";
const BASE = `https://www.thesportsdb.com/api/v1/json/${KEY}`;

const REVALIDATE = { next: { revalidate: 60 * 60 * 24 * 30 } } as const;

type RawPlayer = {
  idPlayer?: string;
  strPlayer?: string;
  strTeam?: string;
  strSport?: string;
  strPosition?: string;
  strNationality?: string;
  dateBorn?: string;
  strCutout?: string | null;
  strThumb?: string | null;
  strRender?: string | null;
  strDescriptionEN?: string | null;
};

type RawTeam = {
  idTeam?: string;
  strTeam?: string;
  strBadge?: string | null;
  strTeamBadge?: string | null;
  strStadium?: string | null;
  strCountry?: string | null;
  strLeague?: string | null;
  intFormedYear?: string | null;
  strDescriptionEN?: string | null;
};

async function getJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, REVALIDATE);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function clamp(text: string | null | undefined, max = 480): string | null {
  const t = (text ?? "").trim();
  if (!t) return null;
  if (t.length <= max) return t;
  return t.slice(0, max - 1).trimEnd() + "…";
}

async function lookupTeamRaw(name: string): Promise<RawTeam | null> {
  const data = await getJson<{ teams?: RawTeam[] }>(
    `${BASE}/searchteams.php?t=${encodeURIComponent(name)}`,
  );
  return data?.teams?.[0] ?? null;
}

async function lookupHonours(id: string): Promise<string[]> {
  const data = await getJson<{
    honours?: { strHonour?: string; strSeason?: string }[];
  }>(`${BASE}/lookuphonours.php?id=${encodeURIComponent(id)}`);
  if (!data?.honours) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const h of data.honours) {
    const name = (h.strHonour ?? "").trim();
    if (!name) continue;
    const label = h.strSeason ? `${name} (${h.strSeason})` : name;
    if (seen.has(label)) continue;
    seen.add(label);
    out.push(label);
    if (out.length >= 8) break;
  }
  return out;
}

async function lookupFormerTeams(id: string): Promise<string[]> {
  const data = await getJson<{
    formerteams?: { strFormerTeam?: string }[];
  }>(`${BASE}/lookupformerteams.php?id=${encodeURIComponent(id)}`);
  if (!data?.formerteams) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of data.formerteams) {
    const name = (t.strFormerTeam ?? "").trim();
    if (!name || seen.has(name)) continue;
    seen.add(name);
    out.push(name);
    if (out.length >= 6) break;
  }
  return out;
}

function teamBadge(t: RawTeam | null): string | null {
  return t?.strBadge ?? t?.strTeamBadge ?? null;
}

export async function fetchSportsPlayer(
  name: string,
): Promise<PlayerReveal | null> {
  const data = await getJson<{ player?: RawPlayer[] }>(
    `${BASE}/searchplayers.php?p=${encodeURIComponent(name)}`,
  );
  const p = data?.player?.[0];
  if (!p || !p.strPlayer) return null;

  const id = p.idPlayer ?? "";

  // Team badge + the (slower) honours/former-team lookups in parallel.
  const [teamRaw, honours, formerTeams] = await Promise.all([
    p.strTeam ? lookupTeamRaw(p.strTeam) : Promise.resolve(null),
    id ? lookupHonours(id) : Promise.resolve([]),
    id ? lookupFormerTeams(id) : Promise.resolve([]),
  ]);

  return {
    kind: "player",
    provider: "thesportsdb",
    name: p.strPlayer,
    sport: p.strSport ?? null,
    image_url: p.strCutout || p.strThumb || p.strRender || null,
    team: p.strTeam ?? null,
    team_badge: teamBadge(teamRaw),
    nationality: p.strNationality ?? null,
    flag: flagEmoji(p.strNationality),
    position: p.strPosition ?? null,
    date_of_birth: p.dateBorn ?? null,
    former_teams: formerTeams,
    honours,
    biography: clamp(p.strDescriptionEN),
    url: id
      ? `https://www.thesportsdb.com/player/${id}`
      : null,
  };
}

export async function fetchSportsTeam(
  name: string,
): Promise<TeamReveal | null> {
  const t = await lookupTeamRaw(name);
  if (!t || !t.strTeam) return null;
  return {
    kind: "team",
    provider: "thesportsdb",
    name: t.strTeam,
    badge: teamBadge(t),
    stadium: t.strStadium ?? null,
    country: t.strCountry ?? null,
    league: t.strLeague ?? null,
    founded: t.intFormedYear ?? null,
    description: clamp(t.strDescriptionEN),
    url: t.idTeam ? `https://www.thesportsdb.com/team/${t.idTeam}` : null,
  };
}

/**
 * Resolve a sports term to a player (preferred) or team. With a "team" hint the
 * order flips. Returns null when neither matches (→ Wikipedia fallback).
 */
export async function fetchSportsEntity(
  name: string,
  prefer: "player" | "team" = "player",
): Promise<PlayerReveal | TeamReveal | null> {
  if (prefer === "team") {
    return (await fetchSportsTeam(name)) ?? (await fetchSportsPlayer(name));
  }
  return (await fetchSportsPlayer(name)) ?? (await fetchSportsTeam(name));
}
