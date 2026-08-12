import type { PrinterStatus } from "../types/printer.types";

interface ConnectPrinterButtonProps {
  status: PrinterStatus;
  onConnect: () => void;
  onDisconnect: () => void;
}

const buttonClass =
  "rounded-2xl px-6 py-3 text-xl font-semibold shadow-lg transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed";

export default function ConnectPrinterButton({
  status,
  onConnect,
  onDisconnect,
}: ConnectPrinterButtonProps) {
  if (status === "connected") {
    return (
      <button
        onClick={onDisconnect}
        className={`${buttonClass} bg-slate-100 text-slate-700 hover:bg-slate-200`}
      >
        Desconectar impresora
      </button>
    );
  }

  const connecting = status === "connecting";

  return (
    <button
      onClick={onConnect}
      disabled={status === "unsupported" || connecting}
      className={`${buttonClass} bg-indigo-600 text-white hover:bg-indigo-700`}
    >
      {connecting ? "Conectando…" : "Conectar impresora"}
    </button>
  );
}
