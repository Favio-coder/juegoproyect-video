import type { BluetoothService } from "./BluetoothService";

const TX = {
  PrintStart: 0x01,
  SetPageSize: 0x13,
  PrintStatus: 0xa3,
  SetDensity: 0x21,
  SetLabelType: 0x23,
  PrintEmptyRow: 0x84,
  PrintBitmapRow: 0x85,
  PageEnd: 0xe3,
  PrintEnd: 0xf3,
  Heartbeat: 0xdc,
} as const;

export interface PrinterProfile {
  printheadPixels: number;
  density: number;
  labelType: number;
}

export const D11_H_PROFILE: PrinterProfile = {
  printheadPixels: 142,
  density: 3,
  labelType: 1,
};

function u16be(n: number): [number, number] {
  return [(n >> 8) & 0xff, n & 0xff];
}

function packet(command: number, data: number[]): Uint8Array {
  const body = new Uint8Array(data);
  const out = new Uint8Array(4 + body.length + 3);
  out[0] = 0x55;
  out[1] = 0x55;
  out[2] = command;
  out[3] = body.length;
  out.set(body, 4);

  let checksum = command;
  for (let i = 0; i < body.length; i++) checksum ^= body[i];

  out[4 + body.length] = checksum;
  out[5 + body.length] = 0xaa;
  out[6 + body.length] = 0xaa;
  return out;
}

/**
 * Counts black (set) bits mirroring niimbluelib's `Utils.countPixelsForBitmapPacket`.
 * With a 142px printhead each row is 18 bytes > 5*3, so "total" mode applies:
 * parts = [0, LL, HH] (little-endian total).
 */
function countBlackPixels(row: Uint8Array): number {
  let count = 0;
  for (let i = 0; i < row.length; i++) {
    let value = row[i];
    while (value) {
      count += value & 1;
      value >>= 1;
    }
  }
  return count;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function rasterize(
  source: HTMLCanvasElement,
  width: number
): { rows: Uint8Array; height: number; rowBytes: number } {
  const scale = width / source.width;
  const height = Math.max(1, Math.round(source.height * scale));
  const rowBytes = Math.ceil(width / 8);

  const temp = document.createElement("canvas");
  temp.width = width;
  temp.height = height;
  const ctx = temp.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("No se pudo preparar la imagen para imprimir");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(source, 0, 0, width, height);

  const data = ctx.getImageData(0, 0, width, height).data;
  const rows = new Uint8Array(height * rowBytes);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const luminance =
        0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      if (luminance < 128) {
        rows[y * rowBytes + (x >> 3)] |= 0x80 >> (x & 7);
      }
    }
  }

  return { rows, height, rowBytes };
}

export class PrintService {
  private readonly bluetooth: BluetoothService;
  private readonly profile: PrinterProfile;

  constructor(
    bluetooth: BluetoothService,
    profile: PrinterProfile = D11_H_PROFILE
  ) {
    this.bluetooth = bluetooth;
    this.profile = profile;
  }

  async print(canvas: HTMLCanvasElement): Promise<void> {
    const width = this.profile.printheadPixels;
    const { rows, height, rowBytes } = rasterize(canvas, width);

    const send = (command: number, data: number[]) =>
      this.bluetooth.send(packet(command, data));

    // Init (D110M_V4)
    await send(TX.SetDensity, [this.profile.density]);
    await send(TX.SetLabelType, [this.profile.labelType]);
    await send(TX.PrintStart, [0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);

    // Page: status packet is sent first and no response is waited
    await send(TX.PrintStatus, [1]);
    await send(TX.SetPageSize, [
      ...u16be(height),
      ...u16be(width),
      ...u16be(1),
      0x00, 0x00,
      0x00,
      0x00,
      0x00, 0x00,
    ]);

    for (let y = 0; y < height; y++) {
      const row = rows.subarray(y * rowBytes, (y + 1) * rowBytes);
      const empty = row.every((value) => value === 0);

      if (empty) {
        await send(TX.PrintEmptyRow, [...u16be(y), 1]);
      } else {
        const black = countBlackPixels(row);
        const [hi, lo] = u16be(black);
        await send(TX.PrintBitmapRow, [
          ...u16be(y),
          0x00,
          lo,
          hi,
          1,
          ...Array.from(row),
        ]);
      }

      await sleep(2);
    }

    await send(TX.PageEnd, [1]);

    // Let the printer finish feeding the label before ending
    await sleep(Math.min(15000, height * 15));

    await send(TX.PrintEnd, [1]);
    await send(TX.Heartbeat, [1]);
  }
}
