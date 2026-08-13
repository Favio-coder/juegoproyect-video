import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRanking } from "../../supabase/services/supabaseService";
import { isSupabaseConfigured } from "../../../core/services/supabaseClient";
import type { Ranking } from "../../supabase/types/db.types";
import { AVATAR_ASSETS } from "../../../core/utils/avatarAssets";
import { useAppStore } from "../../../core/store/appStore";

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

const MEDALS = ["🥇", "🥈", "🥉"];

export default function RankingPage() {
  const navigate = useNavigate();
  const playerName = useAppStore((s) => s.playerName);

  const [data, setData] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const res = await getRanking();
      if (cancelled) return;
      if (res.ok) setData(res.data ?? []);
      else setError(res.error ?? "Error al cargar el ranking.");
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    const res = await getRanking();
    if (res.ok) setData(res.data ?? []);
    else setError(res.error ?? "Error al cargar el ranking.");
    setRefreshing(false);
  }, []);

  const query = normalize(search);

  const filtered = useMemo(() => {
    if (!query) return data;
    return data.filter((r) => normalize(r.name).includes(query));
  }, [data, query]);

  const searchedPlayer = useMemo(() => {
    if (!query) return null;
    return data.find((r) => normalize(r.name).includes(query)) ?? null;
  }, [data, query]);

  const currentPlayer = useMemo(() => {
    if (!playerName) return null;
    const q = normalize(playerName);
    return data.find((r) => normalize(r.name) === q) ?? null;
  }, [data, playerName]);

  const avatarSrc = (r: Ranking): string =>
    AVATAR_ASSETS[r.avatar === "rocko" ? "rocko" : "pingo"].idle;

  const rowIsSearchMatch = (name: string): boolean =>
    query.length > 0 && normalize(name).includes(query);

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        color: "white",
        padding: "24px 16px 48px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 18,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 720,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "10px 18px",
            borderRadius: 999,
            border: "1px solid #334155",
            background: "rgba(255,255,255,0.08)",
            color: "white",
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          ← Menú
        </button>

        <span
          style={{
            background: isSupabaseConfigured ? "#052e16" : "#450a0a",
            border: `1px solid ${isSupabaseConfigured ? "#22c55e" : "#ef4444"}`,
            color: isSupabaseConfigured ? "#4ade80" : "#f87171",
            padding: "6px 14px",
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          {isSupabaseConfigured ? "● Conectado" : "● Sin conexión a la DB"}
        </span>
      </div>

      <header style={{ textAlign: "center" }}>
        <div style={{ fontSize: 64 }}>🏆</div>
        <h1
          style={{
            fontSize: 40,
            fontWeight: 800,
            margin: "4px 0 0",
            background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Ranking de Guardianes
        </h1>
        <p style={{ color: "#94a3b8", fontSize: 17, margin: "6px 0 0" }}>
          ¿Quién es el guardián del movimiento con más puntos?
        </p>
      </header>

      <div
        style={{
          width: "100%",
          maxWidth: 720,
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "rgba(255,255,255,0.08)",
          border: "1px solid #334155",
          borderRadius: 999,
          padding: "8px 18px",
        }}
      >
        <span style={{ fontSize: 20 }}>🔍</span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Busca el nombre de un niño o niña..."
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "white",
            fontSize: 17,
            fontWeight: 600,
            fontFamily: "inherit",
            minWidth: 0,
          }}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            aria-label="Limpiar búsqueda"
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "none",
              color: "white",
              width: 28,
              height: 28,
              borderRadius: "50%",
              cursor: "pointer",
              fontSize: 16,
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        )}
      </div>

      {searchedPlayer && (
        <div
          style={{
            width: "100%",
            maxWidth: 720,
            display: "flex",
            alignItems: "center",
            gap: 16,
            background: "linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.08))",
            border: "2px solid #f59e0b",
            borderRadius: 20,
            padding: "16px 20px",
            boxShadow: "0 8px 30px rgba(245,158,11,0.25)",
          }}
        >
          <img
            src={avatarSrc(searchedPlayer)}
            alt={`${searchedPlayer.name} feliz`}
            style={{ width: 72, height: 72, objectFit: "contain", flexShrink: 0 }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#fbbf24", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {searchedPlayer.name}
            </div>
            <div style={{ fontSize: 16, color: "#e2e8f0", fontWeight: 600 }}>
              Tiene <strong style={{ color: "#fbbf24" }}>{searchedPlayer.puntos_totales} puntos</strong> en {searchedPlayer.partidas} partida{searchedPlayer.partidas === 1 ? "" : "s"}
            </div>
          </div>
          <div style={{ fontSize: 44, flexShrink: 0 }}>
            {MEDALS[data.indexOf(searchedPlayer)] ?? `#${data.indexOf(searchedPlayer) + 1}`}
          </div>
        </div>
      )}

      {loading && (
        <p style={{ color: "#94a3b8", fontSize: 18, fontWeight: 600, margin: "24px 0" }}>
          Cargando ranking...
        </p>
      )}

      {!loading && error && (
        <div
          style={{
            width: "100%",
            maxWidth: 720,
            background: "#450a0a",
            border: "1px solid #ef4444",
            color: "#f87171",
            borderRadius: 16,
            padding: "18px 20px",
            textAlign: "center",
            fontSize: 16,
            fontWeight: 600,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span>{error}</span>
          <button
            onClick={() => void handleRefresh()}
            style={{
              padding: "10px 24px",
              borderRadius: 999,
              border: "none",
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              color: "white",
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && (
        <div
          style={{
            width: "100%",
            maxWidth: 720,
            background: "rgba(255,255,255,0.06)",
            borderRadius: 20,
            border: "1px solid #334155",
            overflow: "hidden",
          }}
        >
          {filtered.length === 0 ? (
            <p style={{ color: "#94a3b8", textAlign: "center", padding: 28, margin: 0, fontSize: 16, fontWeight: 600 }}>
              {query
                ? "No se encontró a nadie con ese nombre. ¡Intenta con otro!"
                : "Aún no hay partidas guardadas. ¡Juega para aparecer aquí!"}
            </p>
          ) : (
            filtered.map((r, i) => {
              const globalIndex = data.indexOf(r);
              const isMatch = rowIsSearchMatch(r.name);
              const isCurrent = currentPlayer?.player_id === r.player_id;
              const isTop3 = globalIndex < 3;

              return (
                <div
                  key={r.player_id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "14px 18px",
                    borderTop: i === 0 ? "none" : "1px solid #334155",
                    background: isMatch
                      ? "rgba(251,191,36,0.12)"
                      : isCurrent
                      ? "rgba(34,197,94,0.10)"
                      : "transparent",
                    boxShadow: isMatch ? "inset 3px 0 0 #f59e0b" : "inset 3px 0 0 transparent",
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      textAlign: "center",
                      fontSize: isTop3 ? 30 : 22,
                      fontWeight: 900,
                      color: isTop3 ? "#fbbf24" : "#64748b",
                      flexShrink: 0,
                    }}
                  >
                    {isTop3 ? MEDALS[globalIndex] : globalIndex + 1}
                  </div>

                  <img
                    src={avatarSrc(r)}
                    alt={`Avatar de ${r.name}`}
                    style={{ width: 52, height: 52, objectFit: "contain", flexShrink: 0 }}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 19, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.name}
                      </span>
                      {isCurrent && (
                        <span
                          style={{
                            background: "#052e16",
                            border: "1px solid #22c55e",
                            color: "#4ade80",
                            fontSize: 12,
                            fontWeight: 700,
                            padding: "2px 10px",
                            borderRadius: 999,
                          }}
                        >
                          ¡Eres tú!
                        </span>
                      )}
                      {isMatch && !isCurrent && (
                        <span
                          style={{
                            background: "rgba(251,191,36,0.15)",
                            border: "1px solid #f59e0b",
                            color: "#fbbf24",
                            fontSize: 12,
                            fontWeight: 700,
                            padding: "2px 10px",
                            borderRadius: 999,
                          }}
                        >
                          Resultado
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 14, color: "#94a3b8", fontWeight: 600 }}>
                      {r.partidas} partida{r.partidas === 1 ? "" : "s"}
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: 26,
                      fontWeight: 900,
                      color: "#fbbf24",
                      fontVariantNumeric: "tabular-nums",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "baseline",
                      gap: 6,
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8" }}>pts</span>
                    {r.puntos_totales}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={() => navigate("/juego")}
          style={{
            padding: "16px 34px",
            borderRadius: 16,
            border: "none",
            background: "linear-gradient(135deg, #22c55e, #16a34a)",
            color: "white",
            fontSize: 19,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          🎮 Jugar de nuevo
        </button>
        <button
          onClick={() => void handleRefresh()}
          disabled={refreshing}
          style={{
            padding: "16px 34px",
            borderRadius: 16,
            border: "1px solid #334155",
            background: "rgba(255,255,255,0.08)",
            color: "white",
            fontSize: 19,
            fontWeight: 700,
            cursor: refreshing ? "wait" : "pointer",
            opacity: refreshing ? 0.6 : 1,
          }}
        >
          🔄 Actualizar
        </button>
      </div>

      {currentPlayer && (
        <span style={{ color: "#64748b", fontSize: 14, fontWeight: 600, textAlign: "center" }}>
          Tu mejor marca: <strong style={{ color: "#fbbf24" }}>{currentPlayer.puntos_totales} pts</strong> · Posición{" "}
          <strong style={{ color: "#fbbf24" }}>#{data.indexOf(currentPlayer) + 1}</strong>
        </span>
      )}
    </div>
  );
}
