import { useRef, useState, useCallback } from "react";
import type { GameState, PoseChallenge } from "../types/game.types";
import type { PoseResult } from "../types/pose.types";
import { PoseValidatorService } from "../services/PoseValidatorService";
import { getRandomChallenges, GAME_CONFIG, getRandomSuccessPhrase } from "../constants/game.constants";
import { useAppStore } from "../../../core/store/appStore";

interface UseGameReturn {
  state: GameState;
  round: number;
  totalRounds: number;
  score: number;
  currentChallenge: PoseChallenge | null;
  successPhrase: string;
  holdProgress: number;
  startGame: () => void;
  onCountdownComplete: () => void;
  onChallengeAccept: () => void;
  onPoseResult: (pose: PoseResult) => void;
  onSuccessComplete: () => void;
  resetGame: () => void;
}

const HOLD_MAX = 3;

export function useGame(): UseGameReturn {
  const [state, setState] = useState<GameState>("intro");
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [currentChallenge, setCurrentChallenge] = useState<PoseChallenge | null>(null);
  const [successPhrase, setSuccessPhrase] = useState("");
  const [holdProgress, setHoldProgress] = useState(0);
  const playerName = useAppStore((s) => s.playerName);

  const challengesRef = useRef<PoseChallenge[]>([]);
  const challengeRef = useRef<PoseChallenge | null>(null);
  const validatorRef = useRef(new PoseValidatorService());
  const holdCounter = useRef(0);

  const startGame = useCallback(() => {
    challengesRef.current = getRandomChallenges(GAME_CONFIG.totalRounds);
    challengeRef.current = null;
    validatorRef.current.reset();
    setScore(0);
    setRound(0);
    setCurrentChallenge(null);
    holdCounter.current = 0;
    setHoldProgress(0);
    setState("countdown");
  }, []);

  const onCountdownComplete = useCallback(() => {
    const challenge = challengesRef.current[round];
    setCurrentChallenge(challenge);
    challengeRef.current = challenge;
    holdCounter.current = 0;
    setHoldProgress(0);
    setState("challengeIntro");
  }, [round]);

  const onChallengeAccept = useCallback(() => {
    const challenge = challengeRef.current;
    if (!challenge) return;
    validatorRef.current.reset(challenge.id);
    holdCounter.current = 0;
    setHoldProgress(0);
    setState("showingPose");
  }, []);

  const onPoseResult = useCallback(
    (pose: PoseResult) => {
      if (state !== "showingPose" || !currentChallenge || !pose.detected) return;

      const isValid = validatorRef.current.validate(
        currentChallenge,
        pose.landmarks
      );

      holdCounter.current = Math.min(
        holdCounter.current + (isValid ? 1 : 0),
        HOLD_MAX
      );
      setHoldProgress(holdCounter.current / HOLD_MAX);

      if (holdCounter.current >= HOLD_MAX) {
        setState("success");
        setSuccessPhrase(getRandomSuccessPhrase(playerName));
        setScore((prev) => prev + GAME_CONFIG.baseScore);
        holdCounter.current = 0;
        setHoldProgress(0);
      }
    },
    [state, currentChallenge, playerName]
  );

  const onSuccessComplete = useCallback(() => {
    const nextRound = round + 1;

    if (nextRound >= GAME_CONFIG.totalRounds) {
      setState("gameOver");
      return;
    }

    setRound(nextRound);
    setCurrentChallenge(null);
    setState("countdown");
  }, [round]);

  const resetGame = useCallback(() => {
    challengesRef.current = [];
    challengeRef.current = null;
    validatorRef.current.reset();
    setState("intro");
    setRound(0);
    setScore(0);
    setCurrentChallenge(null);
    setSuccessPhrase("");
    holdCounter.current = 0;
    setHoldProgress(0);
  }, []);

  return {
    state,
    round,
    totalRounds: GAME_CONFIG.totalRounds,
    score,
    currentChallenge,
    successPhrase,
    holdProgress,
    startGame,
    onCountdownComplete,
    onChallengeAccept,
    onPoseResult,
    onSuccessComplete,
    resetGame,
  };
}
