import { describe, expect, it } from "vitest";
import {
  coerceProviderEvaluation,
  resolveProviderExecution,
} from "../src/infrastructure/providers/providerAdapters";

describe("providerAdapters", () => {
  it("uses the local provider directly in deterministic mode", () => {
    const resolution = resolveProviderExecution({
      mode: "deterministic",
      provider: "openai",
    });

    expect(resolution.effectiveProvider).toBe("local");
    expect(resolution.fallbackTriggered).toBe(false);
    expect(resolution.providerReady).toBe(true);
  });

  it("falls back to local when live mode has no api key", () => {
    const resolution = resolveProviderExecution({
      mode: "live_llm",
      provider: "gemini",
      apiKey: "",
    });

    expect(resolution.effectiveProvider).toBe("local");
    expect(resolution.fallbackTriggered).toBe(true);
    expect(resolution.fallbackReason).toContain("Clé API absente");
  });

  it("coerces an inconsistent low score away from shortlist", () => {
    const coerced = coerceProviderEvaluation(35, 3);

    expect(coerced.decision).toBe("refus");
    expect(coerced.confidenceLabel).toBe("moyenne");
  });

  it("keeps shortlist only for high scores with almost no missing skills", () => {
    const coerced = coerceProviderEvaluation(86, 1);

    expect(coerced.decision).toBe("acceptation shortlist");
    expect(coerced.confidenceLabel).toBe("haute");
  });
});
