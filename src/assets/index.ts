import PlayIcon from "./icons/Play.svg";

export const Icons = {
  play: PlayIcon,
};

import PingoAlegre from "./avatar/pingo/pingoAlegre.svg";
import PingoSentado from "./avatar/pingo/pingoSentado.svg";
import PingoAconsejando from "./avatar/pingo/PingoAconsejando.svg";

import RockoAlegre from "./avatar/rocko/rockoAlegre.svg";
import RockoConsejando from "./avatar/rocko/rockoConsejando.svg";
import RockoParado from "./avatar/rocko/rockoParado.svg";
import RockoSentado from "./avatar/rocko/rockoSentado.svg";

export const Avatars = {
  pingo: {
    happy: PingoAlegre,
    advising: PingoAconsejando,
    idle: PingoSentado,
  },
  rocko: {
    happy: RockoAlegre,
    advising: RockoConsejando,
    standing: RockoParado,
    idle: RockoSentado,
  },
};