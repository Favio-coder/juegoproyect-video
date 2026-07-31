import type { PoseChallenge, GameConfig, PoseId } from "../types/game.types";
import type { Landmark } from "../types/pose.types";

function above(a: Landmark, b: Landmark): boolean {
  return a.y < b.y;
}

function below(a: Landmark, b: Landmark): boolean {
  return a.y > b.y;
}

const CHALLENGES: PoseChallenge[] = [
  {
    id: "arms_up",
    label: "¡Manos arriba!",
    description: "Levanta ambos brazos sobre tus hombros",
    emoji: "🙆",
    validate: (l) =>
      l[15] && l[16] && l[11] && l[12]
        ? above(l[15], l[11]) && above(l[16], l[12])
        : false,
  },
  {
    id: "right_arm_up",
    label: "Brazo derecho arriba",
    description: "Levanta solo tu brazo derecho",
    emoji: "🤚",
    validate: (l) =>
      l[16] && l[12] && l[15] && l[11]
        ? above(l[16], l[12]) && below(l[15], l[11])
        : false,
  },
  {
    id: "left_arm_up",
    label: "Brazo izquierdo arriba",
    description: "Levanta solo tu brazo izquierdo",
    emoji: "✋",
    validate: (l) =>
      l[15] && l[11] && l[16] && l[12]
        ? above(l[15], l[11]) && below(l[16], l[12])
        : false,
  },
  {
    id: "squat",
    label: "¡Agáchate!",
    description: "Flexiona las rodillas como si fueras a sentarte",
    emoji: "🦵",
    validate: (l) => {
      const avgHipY = l[23] && l[24] ? (l[23].y + l[24].y) / 2 : 0;
      const avgKneeY = l[25] && l[26] ? (l[25].y + l[26].y) / 2 : 0;
      if (!avgHipY || !avgKneeY) return false;
      return below({ y: avgHipY } as Landmark, { y: avgKneeY } as Landmark);
    },
  },
  {
    id: "t_pose",
    label: "¡T-Pose!",
    description: "Abre los brazos en cruz como una T",
    emoji: "🤖",
    validate: (l) => {
      if (!l[11] || !l[12] || !l[15] || !l[16]) return false;
      const armsUp = above(l[15], l[11]) && above(l[16], l[12]);
      const shoulderMidY = (l[11].y + l[12].y) / 2;
      const wristY = (l[15].y + l[16].y) / 2;
      const nearShoulder = Math.abs(wristY - shoulderMidY) < 0.15;
      return armsUp && nearShoulder;
    },
  },
  {
    id: "one_foot",
    label: "¡Un pie!",
    description: "Párate en un solo pie",
    emoji: "🦩",
    validate: (l) => {
      if (!l[27] || !l[28] || !l[25] || !l[26]) return false;
      const ankleDiff = Math.abs(l[27].y - l[28].y);
      return ankleDiff > 0.1;
    },
  },
];

export function getRandomChallenges(count: number): PoseChallenge[] {
  const shuffled = [...CHALLENGES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function getChallengeById(id: PoseId): PoseChallenge | undefined {
  return CHALLENGES.find((c) => c.id === id);
}

export const GAME_CONFIG: GameConfig = {
  totalRounds: 5,
  countdownSeconds: 3,
  successDelayMs: 1500,
  checkIntervalMs: 300,
  baseScore: 100,
};

export const PINGO_SPEECH = {
  intro: [
    "¡Hola! Soy Pingo, tu guardián del movimiento.",
    "Hoy aprenderemos juntos algunos ejercicios divertidos.",
    "¿Estás listo para comenzar tu aventura?",
  ],
  countdown: "Preparándote...",
  showPose: "¡Intenta hacer esta pose!",
  success: [
    "¡Excelente! 🎉",
    "¡Muy bien! ⭐",
    "¡Lo hiciste perfecto! 🌟",
    "¡Eres increíble! 💪",
    "¡Sigue así! 🔥",
  ],
  gameOver: "¡Lo lograste! Eres un verdadero guardián del movimiento.",
};

export function getIntroSpeech(playerName?: string): string {
  if (playerName && playerName.trim().length > 0) {
    return `¡Hola, ${playerName.trim()}! Soy Pingo, tu guardián del movimiento. Hoy aprenderemos juntos algunos ejercicios divertidos. ¿Estás listo para comenzar tu aventura?`;
  }
  return PINGO_SPEECH.intro.join(" ");
}

export function getRandomSuccessPhrase(playerName?: string): string {
  const phrases = PINGO_SPEECH.success;
  const phrase = phrases[Math.floor(Math.random() * phrases.length)];

  if (playerName && playerName.trim().length > 0 && Math.random() < 0.5) {
    return `${phrase.replace(/!/, "").trim()}, ${playerName.trim()}!`;
  }
  return phrase;
}

const AVATARS = {
  pingo: {
    happy: "/src/assets/avatar/pingo/pingoAlegre.svg",
    idle: "/src/assets/avatar/pingo/pingoSentado.svg",
  },
};

export { AVATARS };
