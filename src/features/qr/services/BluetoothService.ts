import {
  NIIMBOT_CHARACTERISTIC_UUID,
  NIIMBOT_CONNECT_PACKET,
  NIIMBOT_FF00_SERVICE_UUID,
  NIIMBOT_OPTIONAL_SERVICES,
  NIIMBOT_SERVICE_UUID,
  REQUEST_DEVICE_FILTERS,
} from "../constants/printer.constants";
import {
  PrinterStageError,
  type PrinterConnectionStage,
} from "../types/printer.types";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class BluetoothService {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private service: BluetoothRemoteGATTService | null = null;
  private writeChar: BluetoothRemoteGATTCharacteristic | null = null;
  private notifyChar: BluetoothRemoteGATTCharacteristic | null = null;
  private responseHandler: ((data: DataView) => void) | null = null;
  private onDisconnectedHandler: (() => void) | null = null;
  private isConnecting = false;

  static isSupported(): boolean {
    return (
      typeof navigator !== "undefined" &&
      typeof navigator.bluetooth?.requestDevice === "function"
    );
  }

  static isSecureContext(): boolean {
    return typeof window === "undefined" || window.isSecureContext === true;
  }

  static getSupportHint(): string {
    if (!BluetoothService.isSecureContext()) {
      return "Web Bluetooth requiere un contexto seguro. Abre el proyecto en http://localhost:5173 (localhost es válido) o vía HTTPS.";
    }
    if (typeof navigator !== "undefined" && /Linux/i.test(navigator.userAgent)) {
      return (
        "En Linux, Chrome/Chromium oculta Web Bluetooth por defecto. Actívalo: abre chrome://flags/#enable-experimental-web-platform-features, " +
        "marca Enabled y relanza el navegador. Si lo instalaste con Snap, desinstálalo e instala el .deb oficial desde google.com/chrome " +
        "(la versión Snap suele bloquear el acceso a Bluetooth)."
      );
    }
    return "Este navegador no permite Web Bluetooth. Abre el proyecto con Google Chrome o Microsoft Edge.";
  }

  static async getAvailability(): Promise<boolean | null> {
    const bluetooth = navigator.bluetooth;
    if (!bluetooth || typeof bluetooth.getAvailability !== "function") {
      return null;
    }
    try {
      return await bluetooth.getAvailability();
    } catch {
      return null;
    }
  }

  isConnected(): boolean {
    return this.device !== null && this.device.gatt?.connected === true;
  }

  getDeviceName(): string | undefined {
    return this.device?.name;
  }

  getDeviceId(): string | undefined {
    return this.device?.id;
  }

  getServer(): BluetoothRemoteGATTServer | null {
    return this.server;
  }

  getService(): BluetoothRemoteGATTService | null {
    return this.service;
  }

  getCharacteristic(): BluetoothRemoteGATTCharacteristic | null {
    return this.writeChar;
  }

  setOnDisconnected(handler: (() => void) | null): void {
    this.onDisconnectedHandler = handler;
  }

  async connect(): Promise<void> {
    if (!BluetoothService.isSupported()) {
      throw new PrinterStageError(
        "support",
        "Este navegador no permite Web Bluetooth. Abre el proyecto con Google Chrome o Microsoft Edge.",
        { errorName: "NotSupportedError" }
      );
    }
    if (!BluetoothService.isSecureContext()) {
      throw new PrinterStageError(
        "support",
        "Web Bluetooth requiere un contexto seguro (HTTPS o localhost).",
        { errorName: "SecurityError" }
      );
    }

    console.info("[NIIMBOT] Web Bluetooth disponible");

    this.isConnecting = true;
    try {
      return await this.performConnect();
    } finally {
      this.isConnecting = false;
    }
  }

  private async performConnect(): Promise<void> {
    const availability = await BluetoothService.getAvailability();
    if (availability === false) {
      console.warn(
        "[NIIMBOT][ERROR] Stage: availability - no se detectó un adaptador Bluetooth activo"
      );
    }

    console.info("[NIIMBOT] Solicitando impresora...");
    let device: BluetoothDevice;
    try {
      device = await navigator.bluetooth!.requestDevice({
        filters: REQUEST_DEVICE_FILTERS,
        optionalServices: NIIMBOT_OPTIONAL_SERVICES,
      });
    } catch (cause) {
      console.error("[NIIMBOT][ERROR] Stage: requestDevice", cause);
      if (cause instanceof Error && cause.name === "NotFoundError") {
        throw new PrinterStageError(
          "requestDevice",
          "No se encontró ninguna impresora NIIMBOT. Verifica que esté encendida, cerca y no esté conectada a otra aplicación.",
          { errorName: cause.name, cause }
        );
      }
      throw this.toStageError("requestDevice", cause);
    }

    console.info(`[NIIMBOT] Dispositivo seleccionado: ${device.name ?? device.id}`);
    this.device = device;
    this.attachDisconnectListener(device);

    const maxAttempts = 3;
    let lastCause: unknown = null;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      if (attempt > 1) {
        console.warn(
          `[NIIMBOT] Reintentando conexión (intento ${attempt}/${maxAttempts}) tras espera de 1.5s...`
        );
        this.resetGattState();
        await sleep(1500);
      }
      try {
        await this.establishGatt(device);
        console.info("[NIIMBOT] Impresora lista");
        return;
      } catch (cause) {
        lastCause = cause;
        console.error(
          `[NIIMBOT][ERROR] Intento ${attempt}/${maxAttempts} falló`,
          cause
        );
      }
    }

    if (lastCause instanceof PrinterStageError) {
      throw lastCause;
    }
    throw this.toStageError("gattConnect", lastCause);
  }

  private async establishGatt(device: BluetoothDevice): Promise<void> {
    console.info("[NIIMBOT] Conectando GATT...");
    let server: BluetoothRemoteGATTServer;
    try {
      server = await device.gatt!.connect();
    } catch (cause) {
      console.error("[NIIMBOT][ERROR] Stage: gattConnect", cause);
      throw this.toStageError("gattConnect", cause);
    }
    this.server = server;
    console.info("[NIIMBOT] GATT conectado");

    console.info("[NIIMBOT] Buscando servicio...");
    let service: BluetoothRemoteGATTService;
    try {
      service = await server.getPrimaryService(NIIMBOT_SERVICE_UUID);
    } catch (firstError) {
      try {
        service = await server.getPrimaryService(NIIMBOT_FF00_SERVICE_UUID);
      } catch (fallbackError) {
        console.error("[NIIMBOT][ERROR] Stage: getService", firstError, fallbackError);
        throw new PrinterStageError(
          "getService",
          "El servicio NIIMBOT no se encontró en el dispositivo.",
          { errorName: "NotFoundError", cause: fallbackError }
        );
      }
    }
    this.service = service;
    console.info("[NIIMBOT] Servicio encontrado");

    console.info("[NIIMBOT] Buscando característica...");
    let writeChar: BluetoothRemoteGATTCharacteristic | null;
    try {
      writeChar = await service.getCharacteristic(NIIMBOT_CHARACTERISTIC_UUID);
    } catch (knownError) {
      console.warn(
        "[NIIMBOT] La característica conocida no existe, descubriendo características...",
        knownError
      );
      const characteristics = await service.getCharacteristics();
      writeChar =
        characteristics.find((c) => c.properties.writeWithoutResponse) ??
        characteristics.find((c) => c.properties.write) ??
        null;
    }
    if (!writeChar) {
      console.error("[NIIMBOT][ERROR] Stage: getCharacteristic");
      throw new PrinterStageError(
        "getCharacteristic",
        "La característica de escritura NIIMBOT no se encontró.",
        { errorName: "NotFoundError" }
      );
    }
    this.writeChar = writeChar;
    console.info("[NIIMBOT] Característica encontrada");

    const characteristics = await service.getCharacteristics();
    this.notifyChar =
      (writeChar.properties.notify || writeChar.properties.indicate
        ? writeChar
        : null) ??
      characteristics.find((c) => c.properties.notify) ??
      characteristics.find((c) => c.properties.indicate) ??
      null;
    if (this.notifyChar) {
      this.notifyChar.addEventListener(
        "characteristicvaluechanged",
        this.handleValueChanged
      );
      try {
        await this.notifyChar.startNotifications();
      } catch (cause) {
        console.warn("[NIIMBOT] No se pudieron activar las notificaciones", cause);
      }
    }

    console.info("[NIIMBOT] Enviando paquete de conexión...");
    try {
      await this.send(NIIMBOT_CONNECT_PACKET);
      await sleep(200);
      console.info("[NIIMBOT] Conexión negociada");
    } catch (cause) {
      console.error("[NIIMBOT][ERROR] Stage: configure - paquete de conexión", cause);
      throw this.toStageError("configure", cause);
    }
  }

  private resetGattState(): void {
    this.server = null;
    this.service = null;
    this.writeChar = null;
    this.notifyChar = null;
  }

  async send(data: Uint8Array): Promise<void> {
    if (!this.writeChar) {
      throw new Error("La impresora no está conectada");
    }

    const sizes = [512, 128, 64, 20];
    let usedSize = sizes[0];
    let offset = 0;

    while (offset < data.length) {
      const slice = new Uint8Array(data.subarray(offset, offset + usedSize));
      try {
        await this.writeChar.writeValueWithoutResponse(slice);
        offset += usedSize;
      } catch {
        const smaller = sizes.find((s) => s < usedSize);
        if (!smaller) {
          throw new Error("El tamaño de MTU del dispositivo es muy pequeño");
        }
        usedSize = smaller;
      }
    }
  }

  onResponse(handler: (data: DataView) => void): void {
    this.responseHandler = handler;
  }

  disconnect(): void {
    if (this.notifyChar) {
      this.notifyChar.removeEventListener(
        "characteristicvaluechanged",
        this.handleValueChanged
      );
    }
    if (this.device) {
      this.device.removeEventListener(
        "gattserverdisconnected",
        this.handleDisconnected
      );
    }
    this.device?.gatt?.disconnect();
    this.device = null;
    this.server = null;
    this.service = null;
    this.writeChar = null;
    this.notifyChar = null;
    this.responseHandler = null;
  }

  private attachDisconnectListener(device: BluetoothDevice): void {
    device.removeEventListener(
      "gattserverdisconnected",
      this.handleDisconnected
    );
    device.addEventListener("gattserverdisconnected", this.handleDisconnected);
  }

  private handleDisconnected = (): void => {
    console.warn("[NIIMBOT] GATT desconectado");
    this.server = null;
    this.service = null;
    this.writeChar = null;
    this.notifyChar = null;
    if (!this.isConnecting) {
      this.onDisconnectedHandler?.();
    }
  };

  private handleValueChanged = (event: Event): void => {
    const target = event.target as unknown as BluetoothRemoteGATTCharacteristic;
    if (target?.value && this.responseHandler) {
      this.responseHandler(target.value);
    }
  };

  private toStageError(
    stage: PrinterConnectionStage,
    cause: unknown
  ): PrinterStageError {
    const errorName = cause instanceof Error ? cause.name : "Error";
    const message = cause instanceof Error ? cause.message : String(cause);
    return new PrinterStageError(stage, message, { errorName, cause });
  }
}
