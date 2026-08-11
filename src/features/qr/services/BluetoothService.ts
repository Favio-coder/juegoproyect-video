export class BluetoothService {
  private static readonly NIIMBOT_SERVICE =
    "e7810a71-73ae-499d-8c15-faa9aef0c3f2";
  private static readonly FF00_SERVICE =
    "0000ff00-0000-1000-8000-00805f9b34fb";

  private device: BluetoothDevice | null = null;
  private writeChar: BluetoothRemoteGATTCharacteristic | null = null;
  private notifyChar: BluetoothRemoteGATTCharacteristic | null = null;
  private responseHandler: ((data: DataView) => void) | null = null;

  static isSupported(): boolean {
    return (
      typeof navigator !== "undefined" &&
      !!navigator.bluetooth?.requestDevice
    );
  }

  isConnected(): boolean {
    return this.device !== null && this.device.gatt?.connected === true;
  }

  getDeviceName(): string | undefined {
    return this.device?.name;
  }

  async connect(): Promise<void> {
    if (!BluetoothService.isSupported()) {
      throw new Error("Web Bluetooth no está disponible. Usa Chrome o Edge.");
    }

    const device = await navigator.bluetooth!.requestDevice({
      filters: [
        { namePrefix: "NIIMBOT" },
        { namePrefix: "D11" },
        { services: [BluetoothService.NIIMBOT_SERVICE] },
        { services: [BluetoothService.FF00_SERVICE] },
      ],
      optionalServices: [
        BluetoothService.NIIMBOT_SERVICE,
        BluetoothService.FF00_SERVICE,
      ],
    });

    if (!device.gatt) {
      throw new Error("El dispositivo no expone servicios GATT");
    }

    const server = await device.gatt.connect();

    let service: BluetoothRemoteGATTService;
    try {
      service = await server.getPrimaryService(BluetoothService.NIIMBOT_SERVICE);
    } catch {
      service = await server.getPrimaryService(BluetoothService.FF00_SERVICE);
    }

    const characteristics = await service.getCharacteristics();

    this.writeChar =
      characteristics.find((c) => c.properties.writeWithoutResponse) ??
      characteristics.find((c) => c.properties.write) ??
      null;
    this.notifyChar =
      characteristics.find((c) => c.properties.notify) ?? null;

    if (!this.writeChar) {
      throw new Error("No se encontró un canal de escritura en la impresora");
    }

    if (this.notifyChar) {
      this.notifyChar.addEventListener(
        "characteristicvaluechanged",
        this.handleValueChanged
      );
      await this.notifyChar.startNotifications();
    }

    this.device = device;
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
    this.device?.gatt?.disconnect();
    this.device = null;
    this.writeChar = null;
    this.notifyChar = null;
    this.responseHandler = null;
  }

  private handleValueChanged = (event: Event): void => {
    const target = event.target as unknown as BluetoothRemoteGATTCharacteristic;
    if (target?.value && this.responseHandler) {
      this.responseHandler(target.value);
    }
  };
}
