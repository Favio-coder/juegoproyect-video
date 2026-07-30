import { useEffect, useRef, useState, useCallback } from "react";
import type { ConnectionStatus, PeerError, SessionInfo } from "../types/connection.types";
import { SessionService } from "../services/SessionService";
import { PeerService } from "../services/PeerService";

interface UsePhoneConnectionReturn {
  session: SessionInfo | null;
  status: ConnectionStatus;
  remoteStream: MediaStream | null;
  error: PeerError | null;
  startListening: () => void;
  stopListening: () => void;
}

export function usePhoneConnection(): UsePhoneConnectionReturn {
  const peerService = useRef(new PeerService());

  const [session, setSession] = useState<SessionInfo | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<PeerError | null>(null);

  const stopListening = useCallback(() => {
    peerService.current.destroy();
    setSession(null);
    setRemoteStream(null);
    setError(null);
  }, []);

  const startListening = useCallback(() => {
    stopListening();

    const newSession = SessionService.createSession();
    setSession(newSession);
    setStatus("waiting");
    setError(null);

    peerService.current.setCallbacks({
      onStatus: setStatus,
      onStream: (stream) => {
        setRemoteStream(stream);
      },
      onError: (err) => {
        setError(err);
      },
    });

    peerService.current.createPeer(newSession.sessionId);
  }, [stopListening]);

  useEffect(() => {
    const service = peerService.current;
    return () => {
      service.destroy();
    };
  }, []);

  return {
    session,
    status,
    remoteStream,
    error,
    startListening,
    stopListening,
  };
}
