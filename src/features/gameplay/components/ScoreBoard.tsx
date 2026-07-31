interface ScoreBoardProps {
  score: number;
}

export default function ScoreBoard({ score }: ScoreBoardProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 16px",
        background: "rgba(30,41,59,0.8)",
        borderRadius: 12,
        backdropFilter: "blur(8px)",
      }}
    >
      <span style={{ fontSize: 18 }}>⭐</span>
      <span
        style={{
          color: "#fbbf24",
          fontSize: 20,
          fontWeight: 800,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {score}
      </span>
    </div>
  );
}
