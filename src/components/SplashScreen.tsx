import { motion, AnimatePresence } from "framer-motion";
import { MENU } from "../features/menu/constants/menu.constants";

type Props = {
  progress: number;
  isLoaded: boolean;
};

export default function SplashScreen({ progress, isLoaded }: Props) {
  return (
    <AnimatePresence>
      {!isLoaded && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <motion.h1
            className="select-none text-5xl md:text-7xl font-black tracking-wide text-white drop-shadow-lg"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {MENU.title}
          </motion.h1>

          <motion.h2
            className="mt-2 text-3xl md:text-5xl font-bold text-amber-300 drop-shadow-md"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            {MENU.subtitle}
          </motion.h2>

          <div className="mt-16 w-72 md:w-96">
            <div className="h-3 w-full rounded-full bg-white/20 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>
            <p className="mt-3 text-center text-sm text-white/60 font-medium">
              {progress < 100 ? "Preparando tu aventura..." : "¡Listo!"}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
