import { StackLogger as Core, type StackLoggerConfig } from "@stacklogger/core";
declare const process: { on(event: string, listener: (value: unknown) => void): void; off(event: string, listener: (value: unknown) => void): void };
export const StackLogger = Core; export type { StackLoggerConfig };
export function installNodeCapture() { const unc = (e: unknown) => Core.captureException(e, { handled: false }); const rej = (e: unknown) => Core.captureException(e, { handled: false }); process.on("uncaughtException", unc); process.on("unhandledRejection", rej); return () => { process.off("uncaughtException", unc); process.off("unhandledRejection", rej) } }
