import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNiimbot } from "../hooks/useNiimbot";
import { RewardService } from "../services/RewardService";
import { PrintService } from "../services/PrintService";
import { PrinterStageError } from "../types/printer.types";
import PrinterStatus from "../components/PrinterStatus";
import ConnectPrinterButton from "../components/ConnectPrinterButton";
import PrintTestButton from "../components/PrintTestButton";

type PrintPhase = "idle" | "printing" | "printed";

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
  const {
    status,
    deviceName,
    error,
    adapterWarning,
    supportHint,
    connect,
    disconnect,
    getBluetoothService,
  } = useNiimbot();

  const [printPhase, setPrintPhase] = useState<PrintPhase>("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

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

  const handleConnect = async () => {
    pushLog("Solicitando impresora NIIMBOT…");
    try {
      await connect();
      const name = getBluetoothService().getDeviceName() ?? "NIIMBOT";
      pushLog(`Impresora conectada · ${name}`);
    } catch (cause) {
      const stage = cause instanceof PrinterStageError ? cause.stage : null;
      const message = cause instanceof Error ? cause.message : String(cause);
      pushLog(`Error de conexión (etapa: ${stage ?? "desconocida"}): ${message}`);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setPrintPhase("idle");
    pushLog("Impresora desconectada");
  };

  const printCanvas = async (
    canvas: HTMLCanvasElement,
    label: string
  ): Promise<void> => {
    if (status !== "connected") {
      pushLog("Error: primero conecta la impresora");
      return;
    }
    setPrintPhase("printing");
    pushLog(`Imprimiendo: ${label}`);
    try {
      const printer = new PrintService(getBluetoothService());
      await printer.print(canvas);
      setPrintPhase("printed");
      pushLog("Impresión terminada");
    } catch (cause) {
      setPrintPhase("idle");
      const message = cause instanceof Error ? cause.message : String(cause);
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

  const connected = status === "connected";
  const busy = printPhase === "printing";

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
        {status === "unsupported" && (
          <p className="rounded-2xl bg-rose-100 p-4 text-lg font-semibold text-rose-700">
            {supportHint ??
              "Este navegador no permite Web Bluetooth. Abre el proyecto con Google Chrome o Microsoft Edge."}
          </p>
        )}

        {adapterWarning && (
          <p className="mt-4 rounded-2xl bg-amber-100 p-4 text-lg font-semibold text-amber-700">
            ⚠️ {adapterWarning}
          </p>
        )}

        <div className="mt-6 rounded-3xl bg-white p-6 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <PrinterStatus status={status} deviceName={deviceName} />
            <div className="flex flex-wrap gap-3">
              <ConnectPrinterButton
                status={status}
                onConnect={() => void handleConnect()}
                onDisconnect={handleDisconnect}
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-2xl bg-rose-50 p-4 text-lg font-semibold text-rose-700">
              ⚠️ [etapa: {error.stage}] {error.message}
              {error.errorName && ` (${error.errorName})`}
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
              <PrintTestButton
                label="Imprimir sticker de prueba"
                icon="🏷"
                onClick={() => void handlePrintSticker()}
                disabled={!connected || busy}
              />
              <PrintTestButton
                label="Imprimir patrón de prueba"
                icon="📏"
                variant="secondary"
                onClick={() => void handlePrintPattern()}
                disabled={!connected || busy}
              />
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
