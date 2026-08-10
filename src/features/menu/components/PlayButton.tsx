import { Icons } from "../../../assets";

type Props = {
  onClick: () => void;
};

export default function PlayButton({ onClick }: Props) {
  return (
    <div className="mt-10 flex flex-col items-center gap-4">
      <button
        onClick={onClick}
        aria-label="Jugar"
        className="
          group
          flex
          h-44
          w-44
          items-center
          justify-center
          rounded-full
          shadow-2xl
          transition-all
          duration-300
          hover:scale-110
          hover:shadow-[0_0_50px_rgba(250,152,27,0.6)]
          active:scale-95
        "
      >
        <img
          src={Icons.play}
          alt="Jugar"
          className="h-44 w-44 transition-transform duration-300 group-hover:scale-110"
        />
      </button>

      <span className="rounded-full bg-white/95 px-10 py-2 text-3xl font-black text-[#FA981B] shadow-xl">
        ¡Jugar!
      </span>
    </div>
  );
}