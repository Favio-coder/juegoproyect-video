export const NIIMBOT_SERVICE_UUID = "e7810a71-73ae-499d-8c15-faa9aef0c3f2";
export const NIIMBOT_FF00_SERVICE_UUID =
  "0000ff00-0000-1000-8000-00805f9b34fb";
export const NIIMBOT_CHARACTERISTIC_UUID =
  "bef8d6c9-9c21-4c9e-b632-bd58c1009f9f";
export const CLIENT_CHARACTERISTIC_CONFIG_UUID =
  "00002902-0000-1000-8000-00805f9b34fb";

export const NIIMBOT_DEVICE_NAME = "D11_H-G528010084";
export const NIIMBOT_NAME_PREFIXES = ["NIIMBOT", "D11"] as const;

export const REQUEST_DEVICE_FILTERS: BluetoothRequestDeviceFilter[] = [
  { services: [NIIMBOT_SERVICE_UUID] },
  { services: [NIIMBOT_FF00_SERVICE_UUID] },
  { namePrefix: "NIIMBOT" },
  { namePrefix: "D11" },
];

export const NIIMBOT_OPTIONAL_SERVICES = [
  NIIMBOT_SERVICE_UUID,
  NIIMBOT_FF00_SERVICE_UUID,
];

/**
 * Paquete de conexión (comando 0xC1 con prefijo 0x03).
 * Debe enviarse justo después de conectar GATT; si no, la impresora
 * corta el enlace a los pocos segundos.
 * Byte a byte: 0x03 (prefijo) 55 55 (head) c1 (Connect) 01 (len) 01 (data)
 * c1 (checksum = c1^01^01) aa aa (tail).
 */
export const NIIMBOT_CONNECT_PACKET = new Uint8Array([
  0x03, 0x55, 0x55, 0xc1, 0x01, 0x01, 0xc1, 0xaa, 0xaa,
]);
