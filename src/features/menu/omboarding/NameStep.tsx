import { useState } from "react";

import { useAppStore } from "../../../core/store/appStore";

type Props = {
  onContinue: () => void;
};

export default function NameStep({ onContinue }: Props) {
  const [name, setName] = useState("");
  const saveName = useAppStore((s) => s.setPlayerName);

  const handleContinue = () => {
    if (!name.trim()) return;
    saveName(name.trim());
    onContinue();
  };

  return (
    <div className="w-full max-w-md rounded-3xl bg-white/95 backdrop-blur-md p-8 shadow-2xl animate-fade">
      <h2 className="text-center text-4xl font-bold">¿Cómo te llamas? 🙋</h2>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Escribe tu nombre"
        aria-label="Tu nombre"
        className="mt-8 w-full rounded-2xl border-4 border-orange-300 bg-white px-5 py-5 text-2xl font-semibold text-gray-800 outline-none transition-colors focus:border-orange-500"
      />

      <button
        disabled={!name.trim()}
        onClick={handleContinue}
        className="mt-8 w-full rounded-full bg-[#FA981B] py-5 text-3xl font-bold text-white shadow-lg transition-transform hover:scale-[1.03] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
      >
        Continuar
      </button>
    </div>
  );
}