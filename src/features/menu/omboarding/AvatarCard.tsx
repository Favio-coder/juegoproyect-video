import { motion } from "framer-motion";

type AvatarCardProps = {
  name: string;
  idleImage: string;
  selectedImage: string;
  selected: boolean;
  onSelect: () => void;
};

export default function AvatarCard({
  name,
  idleImage,
  selectedImage,
  selected,
  onSelect,
}: AvatarCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={{
        scale: selected ? 1.05 : 1,
      }}
      className={`
        flex
        flex-col
        items-center
        gap-4
        rounded-3xl
        border-4
        p-6
        transition-colors
        ${
          selected
            ? "border-orange-400 bg-orange-100"
            : "border-transparent bg-white/80"
        }
      `}
    >
      <motion.img
        key={selected ? "happy" : "idle"}
        src={selected ? selectedImage : idleImage}
        alt={name}
        className="h-44 w-auto"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        transition={{
          duration: 0.25,
        }}
      />

      <span className="text-2xl font-bold">
        {name}
      </span>
    </motion.button>
  );
}