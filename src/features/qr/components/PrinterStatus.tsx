import type { PrinterStatus as Status } from "../types/printer.types";

interface PrinterStatusProps {
  status: Status;
  deviceName?: string | null;
}

const STATUS_CONFIG: Record<
  Status,
  { dot: string; label: string; text: string }
> = {
  unsupported: {
    dot: "bg-rose-500",
    label: "Bluetooth no disponible",
    text: "text-rose-700",
  },
  available: {
    dot: "bg-amber-400",
    label: "Sin conectar",
    text: "text-amber-700",
  },
  disconnected: {
    dot: "bg-amber-400",
    label: "Se perdió la conexión",
    text: "text-amber-700",
  },
  connecting: {
    dot: "bg-sky-500 animate-pulse",
    label: "Conectando…",
    text: "text-sky-700",
  },
  connected: {
    dot: "bg-emerald-500",
    label: "NIIMBOT conectada",
    text: "text-emerald-700",
  },
  error: {
    dot: "bg-rose-500",
    label: "Error de conexión",
    text: "text-rose-700",
  },
};

export default function PrinterStatus({
  status,
  deviceName,
}: PrinterStatusProps) {
  const config = STATUS_CONFIG[status];

  return (
    <div className="ml-1 flex items-center gap-3">
      <span className={`h-4 w-4 rounded-full ${config.dot}`} />
      <span className={`text-2xl font-bold ${config.text}`}>
        {config.label}
      </span>
      {deviceName && (
        <span className="text-lg font-medium text-slate-500">
          · {deviceName}
        </span>
      )}
    </div>
  );
}
