import { motion } from "framer-motion";

interface LeafProgressProps {
  progress: number;
}

const LEAVES = ["🍃", "🌿", "🍂", "🍁"];

export default function LeafProgress({ progress }: LeafProgressProps) {
  const fraction = Math.min(Math.max(progress, 0), 1);
  const leafCount = 4;
  const leavesToShow = Math.round(fraction * leafCount);
  const isComplete = fraction >= 1;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 100,
          height: 12,
          background: "rgba(255,255,255,0.15)",
          borderRadius: 6,
          overflow: "hidden",
        }}
      >
        <motion.div
          animate={{ width: `${fraction * 100}%` }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          style={{
            height: "100%",
            background: "linear-gradient(90deg, #22c55e, #16a34a)",
            borderRadius: 6,
            boxShadow: "0 0 10px rgba(34,197,94,0.4)",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          fontSize: 18,
        }}
      >
        {Array.from({ length: leafCount }).map((_, i) => {
          const shown = i < leavesToShow;
          return (
            <motion.span
              key={i}
              initial={false}
              animate={{
                scale: shown ? 1 : 0.4,
                opacity: shown ? 1 : 0.25,
                rotate: shown ? [0, -12, 12, 0] : 0,
              }}
              transition={{ duration: 0.25 }}
              style={{
                display: "inline-block",
                filter: shown ? "none" : "grayscale(1)",
              }}
            >
              {LEAVES[i % LEAVES.length]}
            </motion.span>
          );
        })}
      </div>

      <motion.span
        initial={false}
        animate={{
          scale: isComplete ? 1 : 0,
          opacity: isComplete ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 260, damping: 14 }}
        style={{
          fontSize: 26,
          display: "inline-block",
          filter: "drop-shadow(0 0 8px rgba(251,191,36,0.6))",
        }}
      >
        🌳
      </motion.span>
    </div>
  );
}
