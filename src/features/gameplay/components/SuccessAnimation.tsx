import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SuccessAnimationProps {
  score: number;
  phrase: string;
  onComplete: () => void;
  duration?: number;
}

export default function SuccessAnimation({
  score,
  phrase,
  onComplete,
  duration = 1500,
}: SuccessAnimationProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.5 }}
          transition={{ duration: 0.4 }}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.5)",
            borderRadius: 16,
            zIndex: 40,
            gap: 8,
          }}
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.6 }}
            style={{ fontSize: 64 }}
          >
            ⭐
          </motion.div>

          <p
            style={{
              color: "white",
              fontSize: 24,
              fontWeight: 800,
              margin: 0,
              textAlign: "center",
            }}
          >
            {phrase}
          </p>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              background: "rgba(251,191,36,0.2)",
              padding: "6px 18px",
              borderRadius: 20,
              border: "1px solid rgba(251,191,36,0.4)",
            }}
          >
            <span style={{ fontSize: 16 }}>+</span>
            <span
              style={{
                color: "#fbbf24",
                fontSize: 22,
                fontWeight: 800,
              }}
            >
              {score}
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
