import { useCallback, useEffect, useRef, useState } from "react";
import { BluetoothService } from "../services/BluetoothService";
import { NiimbotService } from "../services/niimbot.service";
import type {
  PrinterStageError,
  PrinterStatus,
} from "../types/printer.types";

export interface UseNiimbotReturn {
  status: PrinterStatus;
  deviceName: string | null;
  error: PrinterStageError | null;
  adapterWarning: string | null;
  supportHint: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  getBluetoothService: () => BluetoothService;
}

export function useNiimbot(): UseNiimbotReturn {
  const serviceRef = useRef<NiimbotService | null>(null);
  const [status, setStatus] = useState<PrinterStatus>(() =>
    BluetoothService.isSupported() ? "available" : "unsupported"
  );
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [error, setError] = useState<PrinterStageError | null>(null);
  const [adapterWarning, setAdapterWarning] = useState<string | null>(null);
  const [supportHint, setSupportHint] = useState<string | null>(() =>
    BluetoothService.isSupported() ? null : BluetoothService.getSupportHint()
  );

  const getService = useCallback(() => {
    if (!serviceRef.current) {
      serviceRef.current = new NiimbotService();
    }
    return serviceRef.current;
  }, []);

  useEffect(() => {
    const service = getService();
    service.setStatusListener((nextStatus, nextError) => {
      setStatus(nextStatus);
      setError(nextError);
      setDeviceName(service.deviceName);
    });
    setStatus(service.status);
    setError(service.error);
    setDeviceName(service.deviceName);
    setSupportHint(
      service.status === "unsupported" ? BluetoothService.getSupportHint() : null
    );

    if (!BluetoothService.isSupported()) {
      setAdapterWarning(null);
      return () => service.setStatusListener(null);
    }

    let cancelled = false;
    BluetoothService.getAvailability().then((available) => {
      if (cancelled || available !== false) return;
      setAdapterWarning(
        "No se detectó un adaptador Bluetooth activo. Revisa que el Bluetooth del sistema esté encendido."
      );
    });

    return () => {
      cancelled = true;
      service.setStatusListener(null);
    };
  }, [getService]);

  const connect = useCallback(async () => {
    const service = getService();
    setError(null);
    await service.connect();
  }, [getService]);

  const disconnect = useCallback(() => {
    getService().disconnect();
  }, [getService]);

  const getBluetoothService = useCallback(() => {
    return getService().bluetoothService;
  }, [getService]);

  return {
    status,
    deviceName,
    error,
    adapterWarning,
    supportHint,
    connect,
    disconnect,
    getBluetoothService,
  };
}
