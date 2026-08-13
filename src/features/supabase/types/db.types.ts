export type AvatarId = "pingo" | "rocko";

export interface Player {
  id: string;
  name: string;
  age: number | null;
  avatar: AvatarId | null;
  created_at: string;
}

export interface GameSession {
  id: string;
  player_id: string;
  score: number;
  total_rounds: number;
  completed_rounds: number;
  session_code: string | null;
  created_at: string;
}

export interface QrCode {
  id: string;
  player_id: string;
  code: string;
  url: string;
  exercise_count: number;
  status: string;
  created_at: string;
  used_at: string | null;
}

export interface Ranking {
  player_id: string;
  name: string;
  avatar: AvatarId | null;
  partidas: number;
  puntos_totales: number;
  ultima_partida: string | null;
}