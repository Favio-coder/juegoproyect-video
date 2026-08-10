import QRCodeLib from "qrcode";
import { PrintService } from "./PrintService";
import type { BluetoothService } from "./BluetoothService";

const PRINT_SCALE = 2;
const STICKER_WIDTH = 142 * PRINT_SCALE;
const INK = "#1e293b";
const STORAGE_KEY = "juegomovi.reward.journal";

export interface RewardRecord {
  playerName: string;
  exerciseCount: number;
  qrText: string;
  printedAt: string;
}

export interface RewardPayload {
  playerName: string;
  exerciseCount: number;
  qrText: string;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("No se pudo cargar el código QR"));
    image.src = src;
  });
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawCentered(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  y: number,
  lineHeight: number
): number {
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  for (const line of lines) {
    ctx.fillText(line, STICKER_WIDTH / 2, y);
    y += lineHeight;
  }
  return y;
}


// Protocolo base para la conexión Bluetooth
export class RewardService {
  static buildQrText(playerName: string): string {
    const base =
      typeof window !== "undefined"
        ? `${window.location.protocol}//${window.location.host}`
        : "http://localhost:5173";
    const slug = (playerName || "PINGO").slice(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, "");
    const code = `GUARD-${slug || "PINGO"}-${Date.now().toString(36).toUpperCase()}`;
    return `${base}/recompensa/${code}`;
  }

  static async createStickerCanvas(
    payload: RewardPayload
  ): Promise<HTMLCanvasElement> {
    const qrDataUrl = await QRCodeLib.toDataURL(payload.qrText, {
      width: 240,
      margin: 1,
      errorCorrectionLevel: "H",
      color: { dark: INK, light: "#ffffff" },
    });
    const qrImage = await loadImage(qrDataUrl);

    const s = PRINT_SCALE;
    const W = STICKER_WIDTH;
    const pad = 8 * s;
    const innerWidth = W - pad * 2;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No se pudo preparar el sticker");

    const headerFont = `800 ${10 * s}px Fredoka, sans-serif`;
    const titleFont = `800 ${16 * s}px Fredoka, sans-serif`;
    const bodyFont = `600 ${9 * s}px Fredoka, sans-serif`;
    const smallFont = `600 ${6.5 * s}px Fredoka, sans-serif`;

    ctx.font = headerFont;
    const headerLines = wrapText(
      ctx,
      "⭐ GUARDIANES DEL MOVIMIENTO",
      innerWidth
    );
    const headerH = headerLines.length * 12 * s;

    const titleH = 20 * s;

    ctx.font = bodyFont;
    const messageLines = wrapText(
      ctx,
      `¡Completaste ${payload.exerciseCount} ejercicios, ${payload.playerName}!`,
      innerWidth
    );
    const messageH = messageLines.length * 12 * s;

    const qrSize = 100 * s;
    const footerH = 12 * s;
    const gap = 6 * s;

    const totalH =
      pad * 2 + headerH + titleH + gap + messageH + gap + qrSize + footerH;

    canvas.width = W;
    canvas.height = Math.ceil(totalH);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, canvas.height);

    let y = pad;
    ctx.fillStyle = INK;

    ctx.font = headerFont;
    y = drawCentered(ctx, headerLines, y, 12 * s);

    ctx.font = titleFont;
    y = drawCentered(ctx, ["🐧 PINGO"], y, 20 * s);
    y += 4 * s;

    ctx.font = bodyFont;
    y = drawCentered(ctx, messageLines, y, 12 * s);

    const qrX = (W - qrSize) / 2;
    const qrY = y + gap;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(qrX, qrY, qrSize, qrSize);
    ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

    ctx.font = smallFont;
    ctx.fillStyle = INK;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(
      payload.qrText.replace(/^.*\/recompensa\//, ""),
      W / 2,
      qrY + qrSize + 2 * s
    );

    return canvas;
  }

  static async printReward(
    bluetooth: BluetoothService,
    payload: RewardPayload
  ): Promise<HTMLCanvasElement> {
    const canvas = await RewardService.createStickerCanvas(payload);
    const printer = new PrintService(bluetooth);
    await printer.print(canvas);
    RewardService.saveRecord(payload);
    return canvas;
  }

  private static saveRecord(payload: RewardPayload): void {
    try {
      const record: RewardRecord = {
        playerName: payload.playerName,
        exerciseCount: payload.exerciseCount,
        qrText: payload.qrText,
        printedAt: new Date().toISOString(),
      };
      const existing = RewardService.getRecords();
      existing.push(record);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    } catch {
      // el registro es best-effort
    }
  }

  static getRecords(): RewardRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as RewardRecord[]) : [];
    } catch {
      return [];
    }
  }
}
