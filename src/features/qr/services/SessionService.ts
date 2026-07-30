import type { SessionInfo } from "../types/connection.types";

const SESSION_PREFIX = "KOEDU";

function randomSegment(length: number): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const SESSION_LENGTH = 6;

export class SessionService {
  static generateSessionId(): string {
    return `${SESSION_PREFIX}-${randomSegment(SESSION_LENGTH)}`;
  }

  static getConnectionUrl(sessionId: string): string {
    const base = typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.host}`
      : "http://localhost:5173";
    return `${base}/connect/${sessionId}`;
  }

  static createSession(): SessionInfo {
    const sessionId = this.generateSessionId();
    return {
      sessionId,
      qrUrl: this.getConnectionUrl(sessionId),
    };
  }

  static isValidSessionId(id: string): boolean {
    const pattern = new RegExp(
      `^${SESSION_PREFIX}-[A-Z0-9]{${SESSION_LENGTH}}$`
    );
    return pattern.test(id);
  }
}
