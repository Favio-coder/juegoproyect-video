import { useRef, useState, useCallback, useEffect } from "react";
import type { GameState, PoseChallenge } from "../types/game.types";
import type { PoseResult } from "../types/pose.types";
import { RepCounterService } from "../services/RepCounterService";
import { HoldTracker } from "../services/HoldTracker";
import { getChallengeSequence, GAME_CONFIG, getRandomSuccessPhrase } from "../constants/game.constants";
import { useAppStore } from "../../../core/store/appStore";

interface UseGameReturn {
  state: GameState;
  round: number;
  totalRounds: number;
  exerciseCount: number;
  score: number;
  currentChallenge: PoseChallenge | null;
  successPhrase: string;
  reps: number;
  repsToComplete: number;
  timeLeft: number;
  repProgress: number;
  holdProgress: number;
  startGame: () => void;
  onCountdownComplete: () => void;
  onChallengeAccept: () => void;
  onPoseResult: (pose: PoseResult) => void;
  onSuccessComplete: () => void;
  onTimeoutComplete: () => void;
  resetGame: () => void;
}

export function useGame(): UseGameReturn {
  const [state, setState] = useState<GameState>("intro");
  const [round, setRound] = useState(0);
  const [totalRounds, setTotalRounds] = useState(0);
  const [exerciseCount, setExerciseCount] = useState(0);
  const [score, setScore] = useState(0);
  const [currentChallenge, setCurrentChallenge] = useState<PoseChallenge | null>(null);
  const [successPhrase, setSuccessPhrase] = useState("");
  const [reps, setReps] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [holdProgress, setHoldProgress] = useState(0);
  const playerName = useAppStore((s) => s.playerName);

  const sequenceRef = useRef<PoseChallenge[]>([]);
  const challengeRef = useRef<PoseChallenge | null>(null);
  const repCounterRef = useRef(new RepCounterService());
  const holdTrackerRef = useRef(new HoldTracker());
  const repsRef = useRef(0);

  const repsToComplete = currentChallenge?.repsToComplete ?? 0;
  const repProgress = repsToComplete > 0 ? reps / repsToComplete : 0;

  useEffect(() => {
    if (state !== "showingPose") return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [state]);

  useEffect(() => {
    if (state === "showingPose" && timeLeft <= 0) {
      setState("timeout");
    }
  }, [state, timeLeft]);

  const startGame = useCallback(() => {
    const sequence = getChallengeSequence();
    sequenceRef.current = sequence;
    challengeRef.current = null;
    repCounterRef.current.reset();
    holdTrackerRef.current.reset();
    repsRef.current = 0;
    setTotalRounds(sequence.length);
    setExerciseCount(sequence.filter((c) => c.kind === "reps").length);
    setScore(0);
    setRound(0);
    setReps(0);
    setTimeLeft(0);
    setHoldProgress(0);
    setCurrentChallenge(null);
    setState("countdown");
  }, []);

  const onCountdownComplete = useCallback(() => {
    const challenge = sequenceRef.current[round];
    if (!challenge) return;

    challengeRef.current = challenge;
    repCounterRef.current.reset();
    holdTrackerRef.current.reset();
    repsRef.current = 0;
    setCurrentChallenge(challenge);
    setReps(0);
    setHoldProgress(0);
    setTimeLeft(challenge.timeLimitSeconds);
    setState("challengeIntro");
  }, [round]);

  const onChallengeAccept = useCallback(() => {
    const challenge = challengeRef.current;
    if (!challenge) return;

    repCounterRef.current.reset();
    holdTrackerRef.current.reset();
    repsRef.current = 0;
    setReps(0);
    setHoldProgress(0);
    setTimeLeft(challenge.timeLimitSeconds);
    setState("showingPose");
  }, []);

  const completeChallenge = useCallback(() => {
    setScore((prev) => prev + GAME_CONFIG.baseScore);
    setSuccessPhrase(getRandomSuccessPhrase(playerName));
    setState("success");
  }, [playerName]);

  const onPoseResult = useCallback(
    (pose: PoseResult) => {
      if (state !== "showingPose" || !currentChallenge) return;

      if (currentChallenge.kind === "hold") {
        const active = pose.detected && currentChallenge.isActive(pose.landmarks);
        const holdMs = holdTrackerRef.current.update(active, pose.timestamp);
        const targetMs = currentChallenge.holdSeconds * 1000;
        setHoldProgress(Math.min(holdMs / targetMs, 1));

        if (targetMs > 0 && holdMs >= targetMs) {
          completeChallenge();
        }
        return;
      }

      if (!pose.detected) return;

      const repCompleted = repCounterRef.current.update(
        currentChallenge,
        pose.landmarks
      );
      if (!repCompleted) return;

      const nextReps = repsRef.current + 1;
      repsRef.current = nextReps;
      setReps(nextReps);
      setScore((prev) => prev + GAME_CONFIG.baseScore);

      if (nextReps >= currentChallenge.repsToComplete) {
        setSuccessPhrase(getRandomSuccessPhrase(playerName));
        setState("success");
      }
    },
    [state, currentChallenge, playerName, completeChallenge]
  );

  const goToNextRound = useCallback(() => {
    const nextRound = round + 1;

    if (nextRound >= sequenceRef.current.length) {
      setState("gameOver");
      return;
    }

    setRound(nextRound);
    setCurrentChallenge(null);
    challengeRef.current = null;
    repCounterRef.current.reset();
    holdTrackerRef.current.reset();
    repsRef.current = 0;
    setReps(0);
    setHoldProgress(0);
    setTimeLeft(0);
    setState("countdown");
  }, [round]);

  const onSuccessComplete = useCallback(() => {
    goToNextRound();
  }, [goToNextRound]);

  const onTimeoutComplete = useCallback(() => {
    goToNextRound();
  }, [goToNextRound]);

  const resetGame = useCallback(() => {
    sequenceRef.current = [];
    challengeRef.current = null;
    repCounterRef.current.reset();
    holdTrackerRef.current.reset();
    repsRef.current = 0;
    setState("intro");
    setRound(0);
    setTotalRounds(0);
    setExerciseCount(0);
    setScore(0);
    setReps(0);
    setHoldProgress(0);
    setTimeLeft(0);
    setCurrentChallenge(null);
    setSuccessPhrase("");
  }, []);

  return {
    state,
    round,
    totalRounds,
    exerciseCount,
    score,
    currentChallenge,
    successPhrase,
    reps,
    repsToComplete,
    timeLeft,
    repProgress,
    holdProgress,
    startGame,
    onCountdownComplete,
    onChallengeAccept,
    onPoseResult,
    onSuccessComplete,
    onTimeoutComplete,
    resetGame,
  };
}