import { useState, useCallback } from "react";
import { isSupabaseConfigured } from "../../../core/services/supabaseClient";
import {
  getPlayers,
  getSessions,
  getQrCodes,
  getRanking,
  seedTestData,
  clearTestData,
} from "../services/supabaseService";
import type { Player, GameSession, QrCode, Ranking } from "../types/db.types";

type Result =
  | { kind: "players"; data: Player[] }
  | { kind: "sessions"; data: GameSession[] }
  | { kind: "qr"; data: QrCode[] }
  | { kind: "ranking"; data: Ranking[] };

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  return date.toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" });
}

export default function SupabaseTestPage() {
  const [result, setResult] = useState<Result | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const run = useCallback(async (fn: () => Promise<unknown>) => {
    setLoading(true);
    setMessage(null);
    try {
      await fn();
    } catch (error) {
      setMessage({ ok: false, text: error instanceof Error ? error.message : String(error) });
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePlayers = () =>
    run(async () => {
      const res = await getPlayers();
      if (res.ok) setResult({ kind: "players", data: res.data ?? [] });
      else setMessage({ ok: false, text: res.error ?? "Error" });
    });

  const handleSessions = () =>
    run(async () => {
      const res = await getSessions();
      if (res.ok) setResult({ kind: "sessions", data: res.data ?? [] });
      else setMessage({ ok: false, text: res.error ?? "Error" });
    });

  const handleQr = () =>
    run(async () => {
      const res = await getQrCodes();
      if (res.ok) setResult({ kind: "qr", data: res.data ?? [] });
      else setMessage({ ok: false, text: res.error ?? "Error" });
    });

  const handleRanking = () =>
    run(async () => {
      const res = await getRanking();
      if (res.ok) setResult({ kind: "ranking", data: res.data ?? [] });
      else setMessage({ ok: false, text: res.error ?? "Error" });
    });

  const handleSeed = () =>
    run(async () => {
      const res = await seedTestData();
      setResult(null);
      setMessage({ ok: res.ok, text: res.error ?? res.message });
    });

  const handleClear = () =>
    run(async () => {
      const res = await clearTestData();
      setResult(null);
      setMessage({ ok: res.ok, text: res.error ?? res.message });
    });

  const buttonStyle: React.CSSProperties = {
    padding: "12px 22px",
    borderRadius: 12,
    border: "none",
    color: "white",
    fontSize: 16,
    fontWeight: 700,
    cursor: loading ? "wait" : "pointer",
    opacity: loading ? 0.6 : 1,
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#0f172a",
        color: "white",
        padding: 24,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
      }}
    >
      <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>
        🧪 Pruebas de base de datos (Supabase)
      </h1>

      <span
        style={{
          background: isSupabaseConfigured ? "#052e16" : "#450a0a",
          border: `1px solid ${isSupabaseConfigured ? "#22c55e" : "#ef4444"}`,
          color: isSupabaseConfigured ? "#4ade80" : "#f87171",
          padding: "8px 18px",
          borderRadius: 999,
          fontSize: 14,
          fontWeight: 700,
        }}
      >
        {isSupabaseConfigured ? "● Conectado a Supabase" : "● Supabase no configurado"}
      </span>

      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          justifyContent: "center",
          maxWidth: 760,
        }}
      >
        <button style={{ ...buttonStyle, background: "linear-gradient(135deg, #3b82f6, #2563eb)" }} onClick={handlePlayers}>
          👦 Ver jugadores
        </button>
        <button style={{ ...buttonStyle, background: "linear-gradient(135deg, #f59e0b, #d97706)" }} onClick={handleSessions}>
          🎮 Ver partidas
        </button>
        <button style={{ ...buttonStyle, background: "linear-gradient(135deg, #8b5cf6, #7c3aed)" }} onClick={handleQr}>
          🔳 Ver códigos QR
        </button>
        <button style={{ ...buttonStyle, background: "linear-gradient(135deg, #22c55e, #16a34a)" }} onClick={handleRanking}>
          🏆 Ver ranking
        </button>
        <button style={{ ...buttonStyle, background: "linear-gradient(135deg, #06b6d4, #0891b2)" }} onClick={handleSeed}>
          ✨ Rellenar datos de prueba
        </button>
        <button style={{ ...buttonStyle, background: "linear-gradient(135deg, #ef4444, #dc2626)" }} onClick={handleClear}>
          🗑 Limpiar tablas
        </button>
      </div>

      {message && (
        <div
          style={{
            background: message.ok ? "#052e16" : "#450a0a",
            border: `1px solid ${message.ok ? "#22c55e" : "#ef4444"}`,
            color: message.ok ? "#4ade80" : "#f87171",
            borderRadius: 12,
            padding: "12px 20px",
            fontSize: 14,
            fontWeight: 600,
            maxWidth: 760,
          }}
        >
          {message.text}
        </div>
      )}

      {result && (
        <div
          style={{
            width: "100%",
            maxWidth: 900,
            background: "#1e293b",
            borderRadius: 16,
            padding: 18,
            overflow: "auto",
          }}
        >
          {result.kind === "players" && (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ textAlign: "left", color: "#94a3b8" }}>
                  <th style={thStyle}>Nombre</th>
                  <th style={thStyle}>Edad</th>
                  <th style={thStyle}>Avatar</th>
                  <th style={thStyle}>Creado</th>
                </tr>
              </thead>
              <tbody>
                {result.data.map((p) => (
                  <tr key={p.id} style={{ borderTop: "1px solid #334155" }}>
                    <td style={tdStyle}>{p.name}</td>
                    <td style={tdStyle}>{p.age ?? "—"}</td>
                    <td style={tdStyle}>{p.avatar ?? "—"}</td>
                    <td style={tdStyle}>{formatDate(p.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {result.kind === "sessions" && (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ textAlign: "left", color: "#94a3b8" }}>
                  <th style={thStyle}>Jugador</th>
                  <th style={thStyle}>Puntaje</th>
                  <th style={thStyle}>Rondas completadas</th>
                  <th style={thStyle}>Código sesión</th>
                  <th style={thStyle}>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {result.data.map((s) => (
                  <tr key={s.id} style={{ borderTop: "1px solid #334155" }}>
                    <td style={tdStyle}>{s.player_id.slice(0, 8)}…</td>
                    <td style={tdStyle}>{s.score}</td>
                    <td style={tdStyle}>{s.completed_rounds}/{s.total_rounds}</td>
                    <td style={tdStyle}>{s.session_code ?? "—"}</td>
                    <td style={tdStyle}>{formatDate(s.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {result.kind === "qr" && (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ textAlign: "left", color: "#94a3b8" }}>
                  <th style={thStyle}>Código</th>
                  <th style={thStyle}>Ejercicios</th>
                  <th style={thStyle}>Estado</th>
                  <th style={thStyle}>Creado</th>
                </tr>
              </thead>
              <tbody>
                {result.data.map((q) => (
                  <tr key={q.id} style={{ borderTop: "1px solid #334155" }}>
                    <td style={{ ...tdStyle, fontFamily: "monospace" }}>{q.code}</td>
                    <td style={tdStyle}>{q.exercise_count}</td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          background: q.status === "active" ? "#052e16" : "#1e3a8a",
                          color: q.status === "active" ? "#4ade80" : "#93c5fd",
                          padding: "2px 10px",
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {q.status}
                      </span>
                    </td>
                    <td style={tdStyle}>{formatDate(q.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {result.kind === "ranking" && (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ textAlign: "left", color: "#94a3b8" }}>
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>Jugador</th>
                  <th style={thStyle}>Avatar</th>
                  <th style={thStyle}>Partidas</th>
                  <th style={thStyle}>Puntos</th>
                  <th style={thStyle}>Última partida</th>
                </tr>
              </thead>
              <tbody>
                {result.data.map((r, i) => (
                  <tr key={r.player_id} style={{ borderTop: "1px solid #334155" }}>
                    <td style={{ ...tdStyle, fontWeight: 800, color: "#fbbf24" }}>
                      {i + 1 === 1 ? "🥇" : i + 1 === 2 ? "🥈" : i + 1 === 3 ? "🥉" : i + 1}
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 700 }}>{r.name}</td>
                    <td style={tdStyle}>{r.avatar ?? "—"}</td>
                    <td style={tdStyle}>{r.partidas}</td>
                    <td style={{ ...tdStyle, fontWeight: 800, color: "#fbbf24" }}>{r.puntos_totales}</td>
                    <td style={tdStyle}>{formatDate(r.ultima_partida)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {result.data.length === 0 && (
            <p style={{ color: "#94a3b8", textAlign: "center", margin: 0, padding: 12 }}>
              No hay registros. Usa "Rellenar datos de prueba".
            </p>
          )}
        </div>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "8px 10px",
  fontSize: 13,
  textTransform: "uppercase",
  letterSpacing: 0.5,
};

const tdStyle: React.CSSProperties = {
  padding: "10px 10px",
  verticalAlign: "top",
};