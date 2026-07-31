import { useMemo } from "react";
import { motion } from "framer-motion";

interface LeafParticlesProps {
  intensity: number;
}

const LEAVES = ["🍃", "🌿", "🍂", "🍁"];

function randomRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export default function LeafParticles({ intensity }: LeafParticlesProps) {
  const particles = useMemo(() => {
    const count = Math.round(4 + intensity * 14);
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      emoji: LEAVES[i % LEAVES.length],
      left: randomRange(5, 95),
      size: randomRange(18, 34),
      delay: randomRange(0, 0.4),
      duration: randomRange(1.4, 2.4),
      drift: randomRange(-60, 60),
      spin: randomRange(-360, 360),
    }));
  }, [intensity]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 25,
      }}
    >
      {particles.map((p) => (
        <motion.span
          key={p.id}
          initial={{ y: 40, x: 0, opacity: 0, rotate: 0 }}
          animate={{
            y: -80,
            x: p.drift,
            opacity: [0, 1, 1, 0],
            rotate: p.spin,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "easeOut",
          }}
          style={{
            position: "absolute",
            bottom: 0,
            left: `${p.left}%`,
            fontSize: p.size,
            display: "inline-block",
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
          }}
        >
          {p.emoji}
        </motion.span>
      ))}
    </div>
  );
}
