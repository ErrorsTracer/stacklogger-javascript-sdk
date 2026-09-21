import type { StackLoggerCaptureConfig, StackLoggerLimits } from "./types.js";
export const DEFAULT_ENDPOINT =
  "https://ingest.stacklogger.io/v0.1/errors/ingest";
export const DEFAULT_CAPTURE: Required<StackLoggerCaptureConfig> = {
  stack: true,
  page: true,
  user: false,
  tags: true,
  contexts: true,
  extra: true,
  breadcrumbs: true,
  request: {
    method: true,
    url: true,
    statusCode: true,
    duration: true,
    traceId: true,
    queryString: false,
    headers: false,
    body: false,
    responseBody: false,
  },
  console: { error: true, warn: true, info: false, debug: false, log: false },
};
export const DEFAULT_LIMITS: StackLoggerLimits = {
  maxBreadcrumbs: 50,
  maxStringLength: 10_000,
  maxObjectDepth: 8,
  maxArrayLength: 100,
  maxEventBytes: 200_000,
};
