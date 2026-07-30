import { Icons } from "../../../assets";

type Props = {
    onClick: () => void
}



export default function PlayButton({onClick}:Props) {

  return (
    <button
        onClick={onClick}
        className="
            group

            h-40
            w-40

            rounded-full

            shadow-xl

            transition-all

            duration-300

            hover:scale-110

            hover:shadow-2xl

            active:scale-95

            flex

            items-center

            justify-center
        "
    >

        <img

            src={Icons.play}

            alt="Jugar"

            className="
                h-40

                w-40

                transition-transform

                duration-300

                group-hover:scale-110
            "

        />

    </button>
    );
}