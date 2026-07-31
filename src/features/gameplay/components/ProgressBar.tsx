interface ProgressBarProps {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const fraction = total > 0 ? current / total : 0;

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 400,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 6,
        }}
      >
        <span style={{ color: "#94a3b8", fontSize: 13, fontWeight: 600 }}>
          Progreso
        </span>
        <span style={{ color: "#94a3b8", fontSize: 13, fontWeight: 600 }}>
          {current}/{total}
        </span>
      </div>

      <div
        style={{
          width: "100%",
          height: 10,
          background: "rgba(255,255,255,0.1)",
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

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 4,
        }}
      >
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: i < current ? "#22c55e" : "rgba(255,255,255,0.15)",
              transition: "background 0.3s",
            }}
          />
        ))}
      </div>
    </div>
  );
}
