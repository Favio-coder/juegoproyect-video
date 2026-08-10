import { useState } from "react";

import { Avatars } from "../../../assets";
import { useAppStore } from "../../../core/store/appStore";
import type { AvatarId } from "../../../core/utils/avatarAssets";

import AvatarCard from "./AvatarCard";

interface AvatarDefinition {
  id: AvatarId;
  name: string;
  idleImage: string;
  selectedImage: string;
}

const AVATARS: AvatarDefinition[] = [
  {
    id: "pingo",
    name: "Pingo",
    idleImage: Avatars.pingo.idle,
    selectedImage: Avatars.pingo.happy,
  },
  {
    id: "rocko",
    name: "Rocko",
    idleImage: Avatars.rocko.idle,
    selectedImage: Avatars.rocko.happy,
  },
];

interface AvatarStepProps {
  onContinue: () => void;
}

export default function AvatarStep({ onContinue }: AvatarStepProps) {
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarId | null>(null);
  const saveAvatar = useAppStore((s) => s.setSelectedAvatar);

  const handleSelect = (id: AvatarId) => {
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
      <h2 className="text-center text-5xl font-bold">Escoge tu guardián ✨</h2>

      <p className="mt-3 text-center text-lg font-semibold text-gray-700">
        Cada guardián te acompañará durante toda la aventura.
      </p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
        {AVATARS.map((avatar) => (
          <AvatarCard
            key={avatar.id}
            name={avatar.name}
            idleImage={avatar.idleImage}
            selectedImage={avatar.selectedImage}
            selected={selectedAvatar === avatar.id}
            onSelect={() => handleSelect(avatar.id)}
          />
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <button
          disabled={!selectedAvatar}
          onClick={handleContinue}
          className="
            rounded-full
            bg-[#FA981B]
            px-12
            py-5
            text-3xl
            font-bold
            text-white
            shadow-lg
            transition-transform
            hover:scale-[1.03]
            active:scale-95
            disabled:opacity-50
            disabled:hover:scale-100
          "
        >
          Continuar
        </button>
      </div>
    </div>
  );
}