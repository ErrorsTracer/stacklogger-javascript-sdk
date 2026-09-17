import { describe, expect, it } from "vitest"; import { normalizeException, sanitize } from "./index.js";
describe("core safety", () => { it("normalizes unknown and circular values", () => { const x: any = { password: "x" }; x.self = x; expect(normalizeException(x).message).toContain("REDACTED") }); it("limits strings", () => expect(sanitize("abcdef", { maxStringLength: 3 })).toBe("abc")) });
