import type { PoseChallenge } from "../types/game.types";

interface PoseGuideProps {
  challenge: PoseChallenge;
  holdProgress: number;
}

export default function PoseGuide({ challenge, holdProgress }: PoseGuideProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        padding: "14px 24px",
        background: "rgba(0,0,0,0.5)",
        borderRadius: 20,
        backdropFilter: "blur(12px)",
        border: "2px solid rgba(255,255,255,0.15)",
        maxWidth: 320,
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span style={{ fontSize: 36, lineHeight: 1 }}>{challenge.emoji}</span>
        <span
          style={{
            color: "white",
            fontSize: 20,
            fontWeight: 800,
            textShadow: "0 2px 4px rgba(0,0,0,0.3)",
          }}
        >
          {challenge.label}
        </span>
      </div>

      <div
        style={{
          width: "100%",
          height: 10,
          background: "rgba(255,255,255,0.15)",
          borderRadius: 5,
          overflow: "hidden",
          boxShadow: "inset 0 1px 3px rgba(0,0,0,0.2)",
        }}
      >
        <div
          style={{
            width: `${Math.min(holdProgress * 100, 100)}%`,
            height: "100%",
            background: "linear-gradient(90deg, #fbbf24, #22c55e)",
            borderRadius: 5,
            transition: "width 0.15s ease",
            boxShadow: "0 0 12px rgba(251,191,36,0.4)",
          }}
        />
      </div>

      <span
        style={{
          color: "#cbd5e1",
          fontSize: 12,
          fontWeight: 500,
        }}
      >
        Mantén la pose...
      </span>
    </div>
  );
}
