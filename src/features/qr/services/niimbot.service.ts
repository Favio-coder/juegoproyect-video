import { BluetoothService } from "./BluetoothService";
import {
  PrinterStageError,
  type PrinterStatus,
} from "../types/printer.types";

export type NiimbotStatusListener = (
  status: PrinterStatus,
  error: PrinterStageError | null
) => void;

/**
 * Servicio de alto nivel para la impresora NIIMBOT D11_H.
 *
 * Encapsula el estado de la conexión y será el punto de entrada del
 * protocolo NIIMBOT (handshake, device info, printer status, label
 * configuration, image encoding y print commands).
 *
 * El protocolo de impresión NO está implementado todavía: primero hay que
 * confirmar que Chrome → Web Bluetooth → D11_H → GATT → servicio →
 * característica funciona de forma estable.
 */
export class NiimbotService {
  private readonly bluetooth: BluetoothService;
  private listener: NiimbotStatusListener | null = null;
  private _status: PrinterStatus;
  private _deviceName: string | null = null;
  private _error: PrinterStageError | null = null;

  constructor() {
    this._status = BluetoothService.isSupported() ? "available" : "unsupported";
    this.bluetooth = new BluetoothService();
    this.bluetooth.setOnDisconnected(() => {
      console.warn("[NIIMBOT] Se perdió la conexión con la impresora");
      this._deviceName = null;
      this._error = null;
      this.setStatus("disconnected");
    });
  }

  get status(): PrinterStatus {
    return this._status;
  }

  get deviceName(): string | null {
    return this._deviceName;
  }

  get error(): PrinterStageError | null {
    return this._error;
  }

  get bluetoothService(): BluetoothService {
    return this.bluetooth;
  }

  setStatusListener(listener: NiimbotStatusListener | null): void {
    this.listener = listener;
  }

  async connect(): Promise<void> {
    this._error = null;
    this.setStatus("connecting");
    try {
      await this.bluetooth.connect();
      this._deviceName = this.bluetooth.getDeviceName() ?? null;
      this._error = null;
      this.setStatus("connected");
    } catch (cause) {
      this._error =
        cause instanceof PrinterStageError
          ? cause
          : new PrinterStageError("done", String(cause));
      this.setStatus("error");
      throw cause;
    }
  }

  disconnect(): void {
    this.bluetooth.disconnect();
    this._deviceName = null;
    this._error = null;
    this.setStatus("available");
  }

  isConnected(): boolean {
    return this.bluetooth.isConnected();
  }

  // ---------------------------------------------------------------
  // Protocolo NIIMBOT — PENDIENTE de implementar.
  // No inventar comandos: estudiar NiimBlue / NiimBlueLib / NiimPrintX
  // y confirmar soporte para D11_H antes de escribir bytes.
  // ---------------------------------------------------------------

  async handshake(): Promise<void> {
    throw new Error("[NIIMBOT] handshake no implementado todavía");
  }

  async getDeviceInfo(): Promise<void> {
    throw new Error("[NIIMBOT] getDeviceInfo no implementado todavía");
  }

  async getPrinterStatus(): Promise<void> {
    throw new Error("[NIIMBOT] getPrinterStatus no implementado todavía");
  }

  async configureLabel(): Promise<void> {
    throw new Error("[NIIMBOT] configureLabel no implementado todavía");
  }

  async encodeImage(): Promise<void> {
    throw new Error("[NIIMBOT] encodeImage no implementado todavía");
  }

  async printCommands(): Promise<void> {
    throw new Error("[NIIMBOT] printCommands no implementado todavía");
  }

  private setStatus(status: PrinterStatus): void {
    this._status = status;
    this.listener?.(this._status, this._error);
  }
}
