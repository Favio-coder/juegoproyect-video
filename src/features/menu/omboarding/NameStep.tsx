import { useState } from "react";

type Props = {

    onContinue: () => void;

};

export default function NameStep({

    onContinue,

}: Props) {

    const [name, setName] = useState("");

    return (

        <div

            className="
                w-full
                max-w-md
                rounded-3xl
                bg-white/90
                backdrop-blur-md
                p-8
                shadow-2xl
                animate-fade
            "

        >

            <h2

                className="
                    text-3xl
                    font-bold
                    text-center
                "

            >

                ¿Cómo te llamas?

            </h2>

            <input

                value={name}

                onChange={(e) => setName(e.target.value)}

                placeholder="Escribe tu nombre"

                className="
                    mt-8
                    w-full
                    rounded-xl
                    border-2
                    border-orange-300
                    px-5
                    py-4
                    text-xl
                    outline-none
                    focus:border-orange-500
                "

            />

            <button

                disabled={!name.trim()}

                onClick={onContinue}

                className="
                    mt-8
                    w-full
                    rounded-full
                    bg-[#FA981B]
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

    );

}