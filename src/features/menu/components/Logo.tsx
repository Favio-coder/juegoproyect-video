import { MENU } from "../constants/menu.constants";

export default function Logo() {
  return (
    <header
      className="select-none text-center"
      aria-label="Logo del juego"
    >
      <h1
        className="
          text-5xl
          md:text-6xl
          lg:text-7xl
          font-black
          tracking-wide
          text-white
          drop-shadow-[0_6px_8px_rgba(0,0,0,.45)]
        "
      >
        {MENU.title}
      </h1>

      <h2
        className="
          mt-2
          text-2xl
          md:text-3xl
          lg:text-4xl
          font-bold
          text-amber-300
          drop-shadow-[0_4px_6px_rgba(0,0,0,.4)]
        "
      >
        {MENU.subtitle}
      </h2>

      <p
        className="
          mt-4
          text-xl
          md:text-2xl
          font-semibold
          text-white/95
          drop-shadow-[0_2px_4px_rgba(0,0,0,.6)]
        "
      >
        {MENU.slogan}
      </p>
    </header>
  );
}