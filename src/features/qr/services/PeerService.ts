import Peer from "peerjs";
import type { MediaConnection } from "peerjs";
import type { ConnectionStatus, PeerError } from "../types/connection.types";

type StatusListener = (status: ConnectionStatus) => void;
type StreamListener = (stream: MediaStream) => void;
type ErrorListener = (error: PeerError) => void;

const PEERJS_HOST = "0.peerjs.com";
const PEERJS_PORT = 443;
const PEERJS_PATH = "/";
const PEERJS_KEY = "peerjs";
const PEERJS_DEBUG = 0;

function peerOptions() {
  return {
    host: PEERJS_HOST,
    port: PEERJS_PORT,
    path: PEERJS_PATH,
    key: PEERJS_KEY,
    debug: PEERJS_DEBUG,
  } as const;
}

export class PeerService {
  private peer: Peer | null = null;
  private activeCall: MediaConnection | null = null;

  private onStatus: StatusListener | null = null;
  private onStream: StreamListener | null = null;
  private onError: ErrorListener | null = null;

  setCallbacks(callbacks: {
    onStatus: StatusListener;
    onStream: StreamListener;
    onError: ErrorListener;
  }): void {
    this.onStatus = callbacks.onStatus;
    this.onStream = callbacks.onStream;
    this.onError = callbacks.onError;
  }

  createPeer(sessionId: string): void {
    this.destroy();

    this.peer = new Peer(sessionId, peerOptions());

    this.peer.on("open", () => {
      this.onStatus?.("waiting");
    });

    this.peer.on("call", (call) => {
      this.onStatus?.("connecting");

      call.on("stream", (remoteStream) => {
        this.activeCall = call;
        this.onStatus?.("connected");
        this.onStream?.(remoteStream);
      });

      call.on("close", () => {
        this.onStatus?.("disconnected");
        this.activeCall = null;
      });

      call.answer();
    });

    this.peer.on("error", (err) => {
      this.onError?.({ message: err.message, code: err.type });
      this.onStatus?.("error");
    });

    this.peer.on("disconnected", () => {
      this.onStatus?.("disconnected");
    });
  }

  async callPeer(
    sessionId: string,
    localStream: MediaStream
  ): Promise<void> {
    if (!this.peer) {
      this.peer = new Peer(peerOptions());

      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(
          () => reject(new Error("Timeout conectando a PeerJS")),
          10000
        );
        this.peer!.on("open", () => {
          clearTimeout(timeout);
          resolve();
        });
        this.peer!.on("error", (err) => {
          clearTimeout(timeout);
          reject(err);
        });
      });
    }

    this.onStatus?.("connecting");

    const call = this.peer.call(sessionId, localStream);

    if (!call) {
      this.onStatus?.("error");
      this.onError?.({ message: "No se pudo establecer la llamada" });
      return;
    }

    this.activeCall = call;

    call.on("stream", () => {
      this.onStatus?.("connected");
    });

    call.on("close", () => {
      this.onStatus?.("disconnected");
      this.activeCall = null;
    });

    call.on("error", (err) => {
      this.onError?.({ message: err.message });
      this.onStatus?.("error");
    });
  }

  destroy(): void {
    if (this.activeCall) {
      this.activeCall.close();
      this.activeCall = null;
    }

    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }

    this.onStatus?.("idle");
  }
}
