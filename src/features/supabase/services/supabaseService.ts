import { supabase } from "../../../core/services/supabaseClient";
import type {
  Player,
  GameSession,
  QrCode,
  Ranking,
  AvatarId,
} from "../types/db.types";

export interface QueryResult<T> {
  ok: boolean;
  data: T[] | null;
  error: string | null;
}

export interface ActionResult {
  ok: boolean;
  message: string;
  error: string | null;
}

const SEED_PLAYERS = [
  { name: "Ana", age: 8, avatar: "pingo" as const },
  { name: "Luis", age: 9, avatar: "rocko" as const },
  { name: "Sofía", age: 8, avatar: "pingo" as const },
];

const SEED_SCORES = [40, 25, 55];
const SEED_ROUNDS = [3, 2, 3];
const SEED_CODES = ["AB12CD", "EF34GH", "IJ56KL"];

function noClientError(): string {
  return "Supabase no está configurado (revisa el archivo .env)";
}

export async function getPlayers(): Promise<QueryResult<Player>> {
  if (!supabase) return { ok: false, data: null, error: noClientError() };
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .order("created_at", { ascending: false });
  return { ok: !error, data, error: error?.message ?? null };
}

export async function getSessions(): Promise<QueryResult<GameSession>> {
  if (!supabase) return { ok: false, data: null, error: noClientError() };
  const { data, error } = await supabase
    .from("game_sessions")
    .select("*")
    .order("created_at", { ascending: false });
  return { ok: !error, data, error: error?.message ?? null };
}

export async function getQrCodes(): Promise<QueryResult<QrCode>> {
  if (!supabase) return { ok: false, data: null, error: noClientError() };
  const { data, error } = await supabase
    .from("qr_codes")
    .select("*")
    .order("created_at", { ascending: false });
  return { ok: !error, data, error: error?.message ?? null };
}

export async function getRanking(): Promise<QueryResult<Ranking>> {
  if (!supabase) return { ok: false, data: null, error: noClientError() };
  const { data, error } = await supabase
    .from("ranking")
    .select("*")
    .order("puntos_totales", { ascending: false });
  return { ok: !error, data, error: error?.message ?? null };
}

export interface RecordSessionParams {
  playerName: string;
  avatar: AvatarId | null;
  score: number;
  totalRounds: number;
  completedRounds: number;
}

export async function recordSession({
  playerName,
  avatar,
  score,
  totalRounds,
  completedRounds,
}: RecordSessionParams): Promise<ActionResult> {
  if (!supabase) return { ok: false, message: "", error: noClientError() };

  const name = playerName?.trim();
  if (!name) return { ok: false, message: "", error: "Falta el nombre del jugador." };

  let playerId: string | null;

  const { data: existing } = await supabase
    .from("players")
    .select("id")
    .eq("name", name)
    .limit(1);

  if (existing && existing.length > 0) {
    playerId = existing[0].id;
  } else {
    const { data: inserted, error: insertError } = await supabase
      .from("players")
      .insert({ name, avatar })
      .select("id")
      .single();

    if (insertError) {
      return { ok: false, message: "", error: insertError.message };
    }
    playerId = inserted?.id ?? null;
  }

  if (!playerId) {
    return { ok: false, message: "", error: "No se pudo identificar al jugador." };
  }

  const { error: sessionError } = await supabase.from("game_sessions").insert({
    player_id: playerId,
    score,
    total_rounds: totalRounds,
    completed_rounds: completedRounds,
    session_code: `KOEDU-${Date.now().toString(36).toUpperCase()}`,
  });

  if (sessionError) {
    return { ok: false, message: "", error: sessionError.message };
  }

  return { ok: true, message: `Partida de ${name} guardada (${score} pts).`, error: null };
}

export async function seedTestData(): Promise<ActionResult> {
  if (!supabase) return { ok: false, message: "", error: noClientError() };

  const { data: existing } = await supabase
    .from("players")
    .select("name");

  const existingNames = new Set((existing ?? []).map((p) => p.name));
  const newPlayers = SEED_PLAYERS.filter((p) => !existingNames.has(p.name));

  if (newPlayers.length === 0) {
    return {
      ok: true,
      message: "Los jugadores de ejemplo ya existen. Usa Limpiar para reiniciar.",
      error: null,
    };
  }

  const { data: inserted, error: playersError } = await supabase
    .from("players")
    .insert(newPlayers)
    .select();

  if (playersError) {
    return { ok: false, message: "", error: playersError.message };
  }

  const players = inserted ?? [];

  if (players.length > 0) {
    const sessions = players.map((p, i) => ({
      player_id: p.id,
      score: SEED_SCORES[i % SEED_SCORES.length],
      total_rounds: 3,
      completed_rounds: SEED_ROUNDS[i % SEED_ROUNDS.length],
      session_code: `KOEDU-${SEED_CODES[i % SEED_CODES.length]}`,
    }));

    const { error: sessionsError } = await supabase
      .from("game_sessions")
      .insert(sessions);

    if (sessionsError) {
      return { ok: false, message: "", error: sessionsError.message };
    }

    const qrCodes = players.map((p, i) => {
      const slug = p.name.slice(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, "");
      return {
        player_id: p.id,
        code: `GUARD-${slug || "PINGO"}-${Date.now().toString(36).toUpperCase()}-${i + 1}`,
        url: `${window.location.origin}/recompensa/GUARD-${slug || "PINGO"}`,
        exercise_count: SEED_ROUNDS[i % SEED_ROUNDS.length],
        status: "active",
      };
    });

    const { error: qrError } = await supabase.from("qr_codes").insert(qrCodes);

    if (qrError) {
      return { ok: false, message: "", error: qrError.message };
    }
  }

  return {
    ok: true,
    message: `Se insertaron ${players.length} jugador(es) con sus partidas y QR.`,
    error: null,
  };
}

export async function clearTestData(): Promise<ActionResult> {
  if (!supabase) return { ok: false, message: "", error: noClientError() };

  const { error: qrError } = await supabase.from("qr_codes").delete().neq("id", "");
  if (qrError) return { ok: false, message: "", error: qrError.message };

  const { error: sessionsError } = await supabase
    .from("game_sessions")
    .delete()
    .neq("id", "");
  if (sessionsError) return { ok: false, message: "", error: sessionsError.message };

  const { error: playersError } = await supabase
    .from("players")
    .delete()
    .neq("id", "");
  if (playersError) return { ok: false, message: "", error: playersError.message };

  return { ok: true, message: "Tablas limpiadas (players, game_sessions, qr_codes).", error: null };
}