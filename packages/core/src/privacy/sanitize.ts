import { DEFAULT_LIMITS } from "../config/defaults.js";
const REDACTED_KEYS =
  /password|passwd|secret|token|apikey|authorization|cookie|creditcard|cardnumber|cvv|ssn/i;
export function sanitize<T>(
  value: T,
  limits: Partial<typeof DEFAULT_LIMITS> = {},
): T {
  const options = { ...DEFAULT_LIMITS, ...limits };
  const seen = new WeakSet<object>();
  function visit(input: unknown, depth: number): unknown {
    if (
      input === undefined ||
      typeof input === "function" ||
      typeof input === "symbol"
    )
      return undefined;
    if (typeof input === "bigint") return String(input);
    if (typeof input === "string")
      return input.slice(0, options.maxStringLength);
    if (input === null || typeof input !== "object") return input;
    if (depth >= options.maxObjectDepth) return "[MaxDepth]";
    if (seen.has(input)) return "[Circular]";
    seen.add(input);
    if (input instanceof Error)
      return { name: input.name, message: input.message, stack: input.stack };
    if (Array.isArray(input))
      return input
        .slice(0, options.maxArrayLength)
        .map((item) => visit(item, depth + 1));
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(input)) {
      if (REDACTED_KEYS.test(key)) result[key] = "[REDACTED]";
      else {
        try {
          const item = visit(
            (input as Record<string, unknown>)[key],
            depth + 1,
          );
          if (item !== undefined) result[key] = item;
        } catch {
          result[key] = "[Unreadable]";
        }
      }
    }
    return result;
  }
  return visit(value, 0) as T;
}
