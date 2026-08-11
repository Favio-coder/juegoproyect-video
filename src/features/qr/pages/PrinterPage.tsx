import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BluetoothService } from "../services/BluetoothService";
import { PrintService } from "../services/PrintService";
import { RewardService } from "../services/RewardService";

type Phase =
  | "idle"
  | "connecting"
  | "connected"
  | "printing"
  | "printed"
  | "error";

function createPatternCanvas(): HTMLCanvasElement {
  const s = 4;
  const width = 142;
  const height = 320;

  const canvas = document.createElement("canvas");
  canvas.width = width * s;
  canvas.height = height * s;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo preparar el patrón de prueba");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 2 * s;
  for (let x = 0; x <= canvas.width + canvas.height; x += 48 * s) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x - canvas.height, canvas.height);
    ctx.stroke();
  }

  ctx.strokeStyle = "#000000";
  ctx.lineWidth = Math.round(0.5 * s);
  for (let x = 0; x <= canvas.width + canvas.height; x += 12 * s) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x - canvas.height, canvas.height);
    ctx.stroke();
  }

  ctx.fillStyle = "#000000";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.font = `800 ${22 * s}px Fredoka, sans-serif`;
  ctx.fillText("TEST", canvas.width / 2, 24 * s);

  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 3 * s;
  ctx.strokeRect(24 * s, 90 * s, 26 * s, 26 * s);
  ctx.fillRect(36 * s, 102 * s, 12 * s, 12 * s);

  return canvas;
}

export default function PrinterPage() {
  const navigate = useNavigate();
  const btRef = useRef<BluetoothService | null>(null);

  const [phase, setPhase] = useState<Phase>("idle");
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const supported = BluetoothService.isSupported();

  useEffect(() => {
    let cancelled = false;
    RewardService.createStickerCanvas({
      playerName: "Pingo",
      exerciseCount: 3,
      qrText: RewardService.buildQrText("Pingo"),
    })
      .then((canvas) => {
        if (!cancelled) setPreview(canvas.toDataURL("image/png"));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const pushLog = (message: string) =>
    setLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ${message}`,
    ]);

  const getBt = (): BluetoothService => {
    if (!btRef.current) btRef.current = new BluetoothService();
    return btRef.current;
  };

  const refreshDeviceName = () =>
    setDeviceName(getBt().getDeviceName() ?? null);

  const handleConnect = async () => {
    setError(null);
    setPhase("connecting");
    try {
      await getBt().connect();
      setPhase("connected");
      refreshDeviceName();
      pushLog("Impresora conectada");
    } catch (cause) {
      setPhase("error");
      const message = cause instanceof Error ? cause.message : String(cause);
      setError(message);
      pushLog(`Error al conectar: ${message}`);
    }
  };

  const handleDisconnect = () => {
    getBt().disconnect();
    setPhase("idle");
    setDeviceName(null);
    pushLog("Impresora desconectada");
  };

  const printCanvas = async (
    canvas: HTMLCanvasElement,
    label: string
  ): Promise<void> => {
    if (phase !== "connected") {
      setError("Primero conecta la impresora");
      setPhase("error");
      return;
    }
    setError(null);
    setPhase("printing");
    pushLog(`Imprimiendo: ${label}`);
    try {
      const printer = new PrintService(getBt());
      await printer.print(canvas);
      setPhase("printed");
      pushLog("Impresión terminada");
    } catch (cause) {
      setPhase("error");
      const message = cause instanceof Error ? cause.message : String(cause);
      setError(message);
      pushLog(`Error al imprimir: ${message}`);
    }
  };

  const handlePrintSticker = async () => {
    const canvas = await RewardService.createStickerCanvas({
      playerName: "Pingo",
      exerciseCount: 3,
      qrText: RewardService.buildQrText("Pingo"),
    });
    await printCanvas(canvas, "Sticker de prueba");
  };

  const handlePrintPattern = async () => {
    await printCanvas(createPatternCanvas(), "Patrón de prueba");
  };

  const phaseStyles: Record<
    Phase,
    { dot: string; label: string; text: string }
  > = {
    idle: { dot: "bg-slate-400", label: "Sin conectar", text: "text-slate-800" },
    connecting: {
      dot: "bg-amber-400 animate-pulse",
      label: "Conectando…",
      text: "text-amber-700",
    },
    connected: { dot: "bg-emerald-500", label: "Conectada", text: "text-emerald-700" },
    printing: {
      dot: "bg-amber-400 animate-pulse",
      label: "Imprimiendo…",
      text: "text-amber-700",
    },
    printed: { dot: "bg-emerald-500", label: "¡Impreso!", text: "text-emerald-700" },
    error: { dot: "bg-rose-500", label: "Error", text: "text-rose-700" },
  };

  const status = phaseStyles[phase];
  const connected = phase === "connected";
  const busy = phase === "printing";

  const buttonClass =
    "rounded-2xl px-6 py-3 text-xl font-semibold shadow-lg transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-sky-100 px-6 py-8">
      <header className="mx-auto flex max-w-4xl items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="rounded-2xl bg-white px-5 py-2.5 text-xl font-semibold text-indigo-600 shadow-md transition hover:bg-indigo-600 hover:text-white active:scale-95"
        >
          ← Menú
        </button>
        <h1 className="text-3xl font-bold text-slate-800 sm:text-4xl">
          🖨 Impresora
        </h1>
        <div className="w-24" />
      </header>

      <section className="mx-auto mt-8 max-w-4xl">
        {!supported && (
          <p className="rounded-2xl bg-rose-100 p-4 text-lg font-semibold text-rose-700">
            Web Bluetooth no está disponible en este navegador. Usa Chrome o
            Edge.
          </p>
        )}

        <div className="mt-6 rounded-3xl bg-white p-6 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="ml-1 flex items-center gap-3">
              <span className={`h-4 w-4 rounded-full ${status.dot}`} />
              <span className={`text-2xl font-bold ${status.text}`}>
                {status.label}
              </span>
              {deviceName && (
                <span className="text-lg font-medium text-slate-500">
                  · {deviceName}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              {connected ? (
                <button
                  onClick={() => void handleDisconnect()}
                  disabled={busy}
                  className={`${buttonClass} bg-slate-100 text-slate-700 hover:bg-slate-200`}
                >
                  Desconectar
                </button>
              ) : (
                <button
                  onClick={() => void handleConnect()}
                  disabled={!supported || phase === "connecting"}
                  className={`${buttonClass} bg-indigo-600 text-white hover:bg-indigo-700`}
                >
                  {phase === "connecting" ? "Conectando…" : "Conectar impresora"}
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-2xl bg-rose-50 p-4 text-lg font-semibold text-rose-700">
              ⚠️ {error}
            </div>
          )}

          <div className="mt-8 grid gap-8 md:grid-cols-[200px_1fr]">
            <div className="flex h-[300px] items-center justify-center overflow-hidden rounded-2xl bg-slate-100 p-3">
              {preview ? (
                <img
                  src={preview}
                  alt="Vista previa del sticker"
                  className="h-full object-contain"
                />
              ) : (
                <span className="text-lg text-slate-400">Generando…</span>
              )}
            </div>

            <div className="flex flex-col justify-center gap-4">
              <button
                onClick={() => void handlePrintSticker()}
                disabled={!connected || busy}
                className={`${buttonClass} bg-emerald-600 text-white hover:bg-emerald-700`}
              >
                🏷 Imprimir sticker de prueba
              </button>
              <button
                onClick={() => void handlePrintPattern()}
                disabled={!connected || busy}
                className={`${buttonClass} bg-sky-600 text-white hover:bg-sky-700`}
              >
                📏 Imprimir patrón de prueba
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl bg-slate-900 p-6 shadow-xl">
          <h2 className="mb-3 text-xl font-bold text-white">Registro</h2>
          <div className="max-h-64 overflow-y-auto rounded-2xl bg-slate-950 p-4 font-mono text-sm leading-relaxed text-emerald-300">
            {logs.length === 0 ? (
              <span className="text-slate-500">
                Esperando conexión…
              </span>
            ) : (
              logs.map((log, index) => <p key={index}>{log}</p>)
            )}
          </div>
        </div>
      </section>
    </main>
  );
}