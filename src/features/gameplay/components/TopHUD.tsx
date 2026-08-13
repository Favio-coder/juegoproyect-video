interface TopHUDProps {
  score: number;
  round: number;
  totalRounds: number;
  timeLeft: number;
  reps: number;
  repsToComplete: number;
  isHold?: boolean;
  holdProgress?: number;
  holdSeconds?: number;
}

export default function TopHUD({
  score,
  round,
  totalRounds,
  timeLeft,
  reps,
  repsToComplete,
  isHold = false,
  holdProgress = 0,
  holdSeconds = 0,
}: TopHUDProps) {
  const fraction = totalRounds > 0 ? round / totalRounds : 0;
  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  const timer = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  const lowTime = timeLeft <= 10;
  const holdRemaining = Math.max(0, holdSeconds - Math.floor(holdProgress * holdSeconds));

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
        <span style={{ fontSize: 26 }}>⭐</span>
        <span
          style={{
            color: "#fbbf24",
            fontSize: 26,
            fontWeight: 800,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {score}
        </span>
        <span style={{ color: "#cbd5e1", fontSize: 18, fontWeight: 700 }}>puntos</span>
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
            color: "#cbd5e1",
            fontSize: 18,
            fontWeight: 700,
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
          gap: 12,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(251,191,36,0.12)",
            padding: "4px 12px",
            borderRadius: 999,
            border: "1px solid rgba(251,191,36,0.3)",
          }}
        >
          {isHold ? (
            <>
              <span style={{ fontSize: 20 }}>⏳</span>
              <span
                style={{
                  color: "#fbbf24",
                  fontSize: 20,
                  fontWeight: 800,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {holdRemaining}s
              </span>
            </>
          ) : (
            <>
              <span style={{ fontSize: 20 }}>💪</span>
              <span
                style={{
                  color: "#fbbf24",
                  fontSize: 20,
                  fontWeight: 800,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {reps}/{repsToComplete}
              </span>
            </>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span style={{ fontSize: 24 }}>⏱</span>
          <span
            style={{
              color: lowTime ? "#ef4444" : "white",
              fontSize: 24,
              fontWeight: 700,
              fontVariantNumeric: "tabular-nums",
              minWidth: 56,
              textAlign: "right",
            }}
          >
            {timer}
          </span>
        </div>
      </div>
    </div>
  );
}
