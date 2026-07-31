import { motion, AnimatePresence } from "framer-motion";

interface CountdownOverlayProps {
  current: number;
}

export default function CountdownOverlay({ current }: CountdownOverlayProps) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.6)",
        borderRadius: 16,
        zIndex: 30,
      }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={current}
          initial={{ scale: 2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            fontSize: 100,
            fontWeight: 900,
            color: "white",
            textShadow: "0 0 40px rgba(59,130,246,0.5)",
          }}
        >
          {current > 0 ? current : "¡Ya!"}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
