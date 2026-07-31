import { useState } from "react";

import { Avatars } from "../../../assets";

import AvatarCard from "./AvatarCard";
import { useAppStore } from "../../../core/store/appStore";

interface AvatarStepProps {
  onContinue: () => void;
}

export default function AvatarStep({ onContinue }: AvatarStepProps) {
  const [selectedAvatar, setSelectedAvatar] =
    useState<string | null>(null);
  const saveAvatar = useAppStore((s) => s.setSelectedAvatar);

  const handleSelect = (id: string) => {
    setSelectedAvatar(id);
    saveAvatar(id);
  };

  const handleContinue = () => {
    if (!selectedAvatar) return;
    onContinue();
  };

  return (
    <div
      className="
        w-full
        max-w-5xl
        rounded-3xl
        bg-white/85
        backdrop-blur-md
        p-10
        shadow-2xl
      "
    >
      <h2 className="text-center text-4xl font-bold">
        Escoge tu guardián
      </h2>

      <p className="mt-2 text-center text-gray-600">
        Cada guardián te acompañará durante toda la aventura.
      </p>

      <div className="mt-10 flex justify-center">
        <AvatarCard
          name="Pingo"
          idleImage={Avatars.pingo.idle}
          selectedImage={Avatars.pingo.happy}
          selected={selectedAvatar === "pingo"}
          onSelect={() => handleSelect("pingo")}
        />
      </div>

      <div className="mt-10 flex justify-center">
        <button
          disabled={!selectedAvatar}
          onClick={handleContinue}
          className="
            rounded-full
            bg-[#FA981B]
            px-10
            py-4
            text-2xl
            font-bold
            text-white
            disabled:opacity-50
          "
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
