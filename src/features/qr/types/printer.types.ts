export type PrinterStatus =
  | "unsupported"
  | "available"
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

export type PrinterConnectionStage =
  | "support"
  | "availability"
  | "requestDevice"
  | "gattConnect"
  | "getService"
  | "getCharacteristic"
  | "configure"
  | "done";

export interface PrinterStageErrorOptions {
  errorName?: string;
  cause?: unknown;
}

export class PrinterStageError extends Error {
  readonly stage: PrinterConnectionStage;
  readonly errorName: string;

  constructor(
    stage: PrinterConnectionStage,
    message: string,
    options: PrinterStageErrorOptions = {}
  ) {
    super(message, { cause: options.cause });
    this.name = "PrinterStageError";
    this.stage = stage;
    this.errorName = options.errorName ?? "Error";
  }
}
