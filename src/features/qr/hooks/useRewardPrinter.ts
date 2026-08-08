import { useCallback, useRef, useState } from "react";
import { BluetoothService } from "../services/BluetoothService";
import { RewardService } from "../services/RewardService";

export type PrinterState =
  | "unsupported"
  | "idle"
  | "connecting"
  | "connected"
  | "printing"
  | "printed"
  | "error";

export function useRewardPrinter(playerName: string, exerciseCount: number) {
  const bluetoothRef = useRef<BluetoothService | null>(null);
  const [state, setState] = useState<PrinterState>(() =>
    BluetoothService.isSupported() ? "idle" : "unsupported"
  );
  const [error, setError] = useState<string | null>(null);

  const getService = useCallback(() => {
    if (!bluetoothRef.current) {
      bluetoothRef.current = new BluetoothService();
    }
    return bluetoothRef.current;
  }, []);

  const connect = useCallback(async () => {
    setError(null);
    setState("connecting");
    try {
      await getService().connect();
      setState("connected");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo conectar la impresora"
      );
      setState("error");
    }
  }, [getService]);

  const printSticker = useCallback(async () => {
    if (!bluetoothRef.current?.isConnected()) {
      setError("Primero conecta la impresora");
      setState("error");
      return;
    }
    setError(null);
    setState("printing");
    try {
      const qrText = RewardService.buildQrText(playerName);
      await RewardService.printReward(bluetoothRef.current, {
        playerName,
        exerciseCount,
        qrText,
      });
      setState("printed");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al imprimir el sticker"
      );
      setState("error");
    }
  }, [playerName, exerciseCount]);

  const disconnect = useCallback(() => {
    bluetoothRef.current?.disconnect();
    setState("idle");
    setError(null);
  }, []);

  return { state, error, connect, printSticker, disconnect };
}
