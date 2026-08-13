import type { PoseChallenge, GameConfig } from "../types/game.types";
import type { Landmark } from "../types/pose.types";

function above(a: { y: number }, b: { y: number }): boolean {
  return a.y < b.y;
}

function handUp(wrist: Landmark | undefined, shoulder: Landmark | undefined): boolean {
  if (!wrist || !shoulder) return false;
  return wrist.y < shoulder.y - 0.12;
}

function tPose(l: Landmark[]): boolean {
  if (!l[11] || !l[12] || !l[15] || !l[16]) return false;
  const shoulderWidth = Math.abs(l[11].x - l[12].x);
  if (shoulderWidth <= 0) return false;
  const shoulderY = (l[11].y + l[12].y) / 2;
  const armOut = shoulderWidth * 1.1;
  const nearY = (p: Landmark) => Math.abs(p.y - shoulderY) < 0.22;
  return (
    l[16].x > l[12].x + armOut &&
    l[15].x < l[11].x - armOut &&
    nearY(l[15]) &&
    nearY(l[16])
  );
}

const HOLD_SECONDS = 10;
const HOLD_TIME_LIMIT = 30;

export const DIAGNOSTICS: PoseChallenge[] = [
  {
    id: "right_hand",
    kind: "hold",
    label: "¡Mano derecha arriba!",
    description: "Levanta tu mano derecha bien arriba",
    emoji: "✋",
    repsToComplete: 0,
    holdSeconds: HOLD_SECONDS,
    timeLimitSeconds: HOLD_TIME_LIMIT,
    isActive: (l) => handUp(l[16], l[12]),
  },
  {
    id: "left_hand",
    kind: "hold",
    label: "¡Mano izquierda arriba!",
    description: "Levanta tu mano izquierda bien arriba",
    emoji: "🤚",
    repsToComplete: 0,
    holdSeconds: HOLD_SECONDS,
    timeLimitSeconds: HOLD_TIME_LIMIT,
    isActive: (l) => handUp(l[15], l[11]),
  },
  {
    id: "both_hands",
    kind: "hold",
    label: "¡Las dos manos arriba!",
    description: "Levanta las dos manos como un robot",
    emoji: "🙌",
    repsToComplete: 0,
    holdSeconds: HOLD_SECONDS,
    timeLimitSeconds: HOLD_TIME_LIMIT,
    isActive: (l) => handUp(l[16], l[12]) && handUp(l[15], l[11]),
  },
  {
    id: "t_pose",
    kind: "hold",
    label: "¡Pose T!",
    description: "Abre los brazos en forma de T",
    emoji: "✳️",
    repsToComplete: 0,
    holdSeconds: HOLD_SECONDS,
    timeLimitSeconds: HOLD_TIME_LIMIT,
    isActive: (l) => tPose(l),
  },
];

export const EXERCISES: PoseChallenge[] = [
  {
    id: "jumping_jacks",
    kind: "reps",
    label: "¡Polichinelas!",
    description: "Salta abriendo brazos y piernas como una estrella",
    emoji: "⭐",
    repsToComplete: 8,
    holdSeconds: 0,
    timeLimitSeconds: 60,
    isActive: (l) => {
      if (!l[11] || !l[12] || !l[15] || !l[16] || !l[27] || !l[28]) return false;
      const wristsUp = above(l[15], l[11]) && above(l[16], l[12]);
      const shoulderWidth = Math.abs(l[11].x - l[12].x);
      const feetApart = Math.abs(l[27].x - l[28].x) > shoulderWidth * 1.8;
      return wristsUp && feetApart;
    },
  },
  {
    id: "march",
    kind: "reps",
    label: "¡Marcha!",
    description: "Corre en el lugar levantando bien las rodillas",
    emoji: "🏃",
    repsToComplete: 10,
    holdSeconds: 0,
    timeLimitSeconds: 45,
    isActive: (l) => {
      if (!l[23] || !l[24] || !l[25] || !l[26]) return false;
      const hipY = (l[23].y + l[24].y) / 2;
      const kneeRaised = above(l[25], { y: hipY }) || above(l[26], { y: hipY });
      return kneeRaised;
    },
  },
];

export function getChallengeSequence(): PoseChallenge[] {
  return [...DIAGNOSTICS, ...EXERCISES];
}

export const GAME_CONFIG: GameConfig = {
  totalRounds: DIAGNOSTICS.length + EXERCISES.length,
  countdownSeconds: 3,
  successDelayMs: 1500,
  checkIntervalMs: 300,
  baseScore: 15,
};

export const PINGO_SPEECH = {
  intro: [
    "¡Hola! Soy Pingo, tu guardián del movimiento.",
    "Primero haremos una prueba rápida de diagnóstico.",
    "Después polichinelas y marcha. ¿Listo?",
  ],
  countdown: "Preparándote...",
  introGreeting: (avatarName: string) =>
    `¡Hola! Soy ${avatarName}, tu guardián del movimiento.`,
  introMission:
    "Primero haremos una prueba de diagnóstico levantando las manos y haciendo la pose T. Después polichinelas y marcha. ¿Estás listo?",
  showPose: "¡Intenta hacer este ejercicio!",
  success: [
    "¡Excelente! 🎉",
    "¡Muy bien! ⭐",
    "¡Lo hiciste perfecto! 🌟",
    "¡Eres increíble! 💪",
    "¡Sigue así! 🔥",
  ],
  timeout: "¡Se acabó el tiempo! Sigue practicando 💪",
  gameOver: "¡Lo lograste! Eres un verdadero guardián del movimiento.",
};

export function getIntroSpeech(playerName?: string, avatarName = "Pingo"): string {
  const parts = getIntroParts(playerName, avatarName);
  return `${parts.greeting} ${parts.plan} ${parts.goal} ${parts.ready}`;
}

export function getIntroParts(
  playerName?: string,
  avatarName = "Pingo"
): { greeting: string; plan: string; goal: string; ready: string } {
  const name = playerName && playerName.trim().length > 0 ? playerName.trim() : "amiguito";
  return {
    greeting: `¡Hola, ${name}! Soy ${avatarName}, tu guardián del movimiento.`,
    plan: "Primero haremos una prueba de diagnóstico: levantarás cada mano y harás la pose T.",
    goal: "Después haremos polichinelas y marcha. Completa las repeticiones para pasar al siguiente.",
    ready: "¿Estás listo para comenzar tu aventura?",
  };
}

export function getRandomSuccessPhrase(playerName?: string): string {
  const phrases = PINGO_SPEECH.success;
  const phrase = phrases[Math.floor(Math.random() * phrases.length)];

  if (playerName && playerName.trim().length > 0 && Math.random() < 0.5) {
    return `${phrase.replace(/!/, "").trim()}, ${playerName.trim()}!`;
  }
  return phrase;
}