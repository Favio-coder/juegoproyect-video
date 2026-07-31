import { useEffect, useCallback } from "react";
import ForestBackground from "../components/ForestBackground";
import CameraView from "../components/CameraView";
import PenguinCoach from "../components/PenguinCoach";
import TopHUD from "../components/TopHUD";
import CountdownOverlay from "../components/CountdownOverlay";
import SuccessAnimation from "../components/SuccessAnimation";
import GameOverScreen from "../components/GameOverScreen";
import ChallengeModal from "../components/ChallengeModal";
import LeafParticles from "../components/LeafParticles";
import LeafProgress from "../components/LeafProgress";
import { usePhoneConnection } from "../../qr/hooks/usePhoneConnection";
import { useGame } from "../hooks/useGame";
import { useCountdown } from "../hooks/useCountdown";
import { useElapsedTime } from "../hooks/useElapsedTime";
import { GAME_CONFIG, getIntroSpeech } from "../constants/game.constants";
import { useAppStore } from "../../../core/store/appStore";

export default function GameplayPage() {
  const game = useGame();
  const playerName = useAppStore((s) => s.playerName);
  const { remoteStream } = usePhoneConnection();
  const countdown = useCountdown(GAME_CONFIG.countdownSeconds, () => {
    game.onCountdownComplete();
  });

  const timerRunning = game.state !== "intro" && game.state !== "gameOver";
  const elapsed = useElapsedTime(timerRunning);

  useEffect(() => {
    if (game.state === "countdown") {
      countdown.start();
    }
  }, [game.state, countdown]);

  const handleStart = useCallback(() => {
    game.startGame();
  }, [game]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === "Space" || e.code === "Enter") {
      e.preventDefault();
      if (game.state === "intro") game.startGame();
      else if (game.state === "challengeIntro") game.onChallengeAccept();
    }
  }, [game]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (game.state === "gameOver") {
    return (
      <GameOverScreen
        score={game.score}
        totalRounds={game.totalRounds}
        onPlayAgain={game.resetGame}
      />
    );
  }

  if (game.state === "intro") {
    return (
      <div
        style={{
          position: "relative",
          height: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          overflow: "hidden",
        }}
      >
        <ForestBackground />
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 36,
          }}
        >
          <PenguinCoach key="intro" message={getIntroSpeech(playerName)} mood="idle" size="lg" />
          <button
            onClick={handleStart}
            style={{
              padding: "20px 60px",
              borderRadius: 18,
              border: "none",
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              color: "white",
              fontSize: 24,
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 8px 32px rgba(34,197,94,0.3)",
            }}
          >
            ¡Comenzar!
          </button>
          <span style={{ color: "#94a3b8", fontSize: 16, fontWeight: 500 }}>
            Presiona espacio o enter
          </span>
        </div>
      </div>
    );
  }

  const pingoMessage =
    game.state === "showingPose" || game.state === "checkingPose"
      ? game.currentChallenge?.description ?? ""
      : game.state === "success"
      ? game.successPhrase
      : "";

  const pingoMood = game.state === "success" ? "happy" : game.state === "showingPose" ? "advising" : "idle";
  const challenge = game.currentChallenge;

  return (
    <div
      style={{
        position: "relative",
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        color: "white",
        overflow: "hidden",
      }}
    >
      <ForestBackground />

      <TopHUD
        score={game.score}
        round={game.state === "success" ? game.round + 1 : game.round}
        totalRounds={game.totalRounds}
        elapsed={elapsed}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          display: "flex",
          minHeight: 0,
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            overflow: "hidden",
          }}
        >
          <CameraView remoteStream={remoteStream} onPoseResult={game.onPoseResult} />

          {game.state === "showingPose" && game.holdProgress > 0 && (
            <LeafParticles intensity={game.holdProgress} />
          )}

          {game.state === "countdown" && (
            <CountdownOverlay current={countdown.current} />
          )}

          {game.state === "success" && (
            <SuccessAnimation
              score={GAME_CONFIG.baseScore}
              phrase={game.successPhrase}
              onComplete={game.onSuccessComplete}
              duration={GAME_CONFIG.successDelayMs}
            />
          )}

          {(game.state === "showingPose" || game.state === "success") && (
            <div
              style={{
                position: "absolute",
                bottom: 100,
                left: "50%",
                transform: "translateX(-50%)",
                maxWidth: "92%",
                zIndex: 50,
              }}
            >
              <PenguinCoach
                key={game.state === "success" ? game.successPhrase : game.currentChallenge?.id ?? "idle"}
                message={pingoMessage}
                mood={pingoMood}
              />
            </div>
          )}

          {game.state === "showingPose" && challenge && (
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 45,
                background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
                padding: "44px 16px 14px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                }}
              >
                {/* <span style={{ fontSize: 34 }}>{challenge.emoji}</span> */}
                <span
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                  }}
                >
                  {challenge.label}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginTop: 6,
                }}
              >
                <span style={{ fontSize: 20, flexShrink: 0 }}>💡</span>
                <span
                  style={{
                    flex: 1,
                    fontSize: 15,
                    fontWeight: 500,
                    color: "#e2e8f0",
                    lineHeight: 1.4,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {challenge.description}
                </span>
                <LeafProgress progress={game.holdProgress} />
              </div>
            </div>
          )}
        </div>
      </div>

      {game.state === "challengeIntro" && challenge && (
        <ChallengeModal
          challenge={challenge}
          onAccept={game.onChallengeAccept}
        />
      )}
    </div>
  );
}
