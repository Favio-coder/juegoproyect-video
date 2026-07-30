export type ConnectionStatus =
  | "idle"
  | "waiting"
  | "connecting"
  | "connected"
  | "error"
  | "disconnected";

export interface SessionInfo {
  sessionId: string;
  qrUrl: string;
}

export interface PeerError {
  message: string;
  code?: string;
}
