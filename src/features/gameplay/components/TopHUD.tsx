interface TopHUDProps {
  score: number;
  round: number;
  totalRounds: number;
  elapsed: number;
}

export default function TopHUD({ score, round, totalRounds, elapsed }: TopHUDProps) {
  const fraction = totalRounds > 0 ? round / totalRounds : 0;
  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  const timer = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: "10px 16px",
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        zIndex: 5,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 22 }}>⭐</span>
        <span
          style={{
            color: "#fbbf24",
            fontSize: 22,
            fontWeight: 800,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {score}
        </span>
        <span style={{ color: "#94a3b8", fontSize: 15, fontWeight: 600 }}>pts</span>
      </div>

      <div
        style={{
          flex: 1,
          maxWidth: 300,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            flex: 1,
            height: 10,
            background: "rgba(255,255,255,0.12)",
            borderRadius: 5,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${fraction * 100}%`,
              height: "100%",
              background: "linear-gradient(90deg, #22c55e, #16a34a)",
              borderRadius: 5,
              transition: "width 0.5s ease",
            }}
          />
        </div>
        <span
          style={{
            color: "#94a3b8",
            fontSize: 14,
            fontWeight: 600,
            whiteSpace: "nowrap",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {round}/{totalRounds}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 20 }}>⏱</span>
        <span
          style={{
            color: "white",
            fontSize: 20,
            fontWeight: 700,
            fontVariantNumeric: "tabular-nums",
            minWidth: 52,
            textAlign: "right",
          }}
        >
          {timer}
        </span>
      </div>
    </div>
  );
}
