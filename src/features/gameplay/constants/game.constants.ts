import type { PoseChallenge, GameConfig } from "../types/game.types";

function above(a: { y: number }, b: { y: number }): boolean {
  return a.y < b.y;
}

function below(a: { y: number }, b: { y: number }): boolean {
  return a.y > b.y;
}

export const EXERCISES: PoseChallenge[] = [
  {
    id: "jumping_jacks",
    label: "¡Polichinelas!",
    description: "Salta abriendo brazos y piernas como una estrella",
    emoji: "⭐",
    repsToComplete: 8,
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
    id: "squats",
    label: "¡Sentadillas!",
    description: "Agáchate bajando la cadera como si fueras a sentarte",
    emoji: "🦵",
    repsToComplete: 8,
    timeLimitSeconds: 60,
    isActive: (l) => {
      const avgHipY = l[23] && l[24] ? (l[23].y + l[24].y) / 2 : 0;
      const avgKneeY = l[25] && l[26] ? (l[25].y + l[26].y) / 2 : 0;
      if (!avgHipY || !avgKneeY) return false;
      return below({ y: avgHipY }, { y: avgKneeY });
    },
  },
  {
    id: "march",
    label: "¡Marcha!",
    description: "Corre en el lugar levantando bien las rodillas",
    emoji: "🏃",
    repsToComplete: 10,
    timeLimitSeconds: 45,
    isActive: (l) => {
      if (!l[23] || !l[24] || !l[25] || !l[26]) return false;
      const hipY = (l[23].y + l[24].y) / 2;
      const kneeRaised = above(l[25], { y: hipY }) || above(l[26], { y: hipY });
      return kneeRaised;
    },
  },
];

export function getExerciseSequence(): PoseChallenge[] {
  return EXERCISES;
}

export const GAME_CONFIG: GameConfig = {
  totalRounds: 3,
  countdownSeconds: 3,
  successDelayMs: 1500,
  checkIntervalMs: 300,
  baseScore: 15,
};

export const PINGO_SPEECH = {
  intro: [
    "¡Hola! Soy Pingo, tu guardián del movimiento.",
    "Hoy haremos polichinelas, sentadillas y marcha.",
    "Completa las repeticiones de cada ejercicio para pasar al siguiente. ¿Listo?",
  ],
  countdown: "Preparándote...",
  introGreeting: (avatarName: string) =>
    `¡Hola! Soy ${avatarName}, tu guardián del movimiento.`,
  introMission:
    "Hoy haremos polichinelas, sentadillas y marcha. Completa las repeticiones de cada ejercicio para pasar al siguiente. ¿Estás listo para comenzar tu aventura?",
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
    plan: "Hoy haremos polichinelas, sentadillas y marcha.",
    goal: "Completa las repeticiones de cada ejercicio para pasar al siguiente.",
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
