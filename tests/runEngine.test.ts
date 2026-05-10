import { describe, expect, it } from "vitest";
import { jobDescriptionRaw } from "../src/data/demo";
import {
  buildRunRecordFromBlueprint,
  buildScreeningRunBlueprint,
  executeScreeningRun,
} from "../src/lib/runEngine";

describe("runEngine", () => {
  it("builds a deterministic blueprint with artifacts and summaries", () => {
    const blueprint = buildScreeningRunBlueprint(jobDescriptionRaw);

    expect(blueprint.mode).toBe("deterministic");
    expect(blueprint.provider).toBe("local");
    expect(blueprint.candidateResults.length).toBe(3);
    expect(blueprint.artifacts.some((artifact) => artifact.kind === "job_description")).toBe(true);
    expect(blueprint.artifacts.some((artifact) => artifact.kind === "run_summary")).toBe(true);
    expect(blueprint.steps[0]?.agentName).toBe("Job Intake Agent");
    expect(blueprint.steps.at(-1)?.agentName).toBe("Review Gate Agent");
  });

  it("creates a run record from the blueprint", () => {
    const blueprint = buildScreeningRunBlueprint(jobDescriptionRaw);
    const record = buildRunRecordFromBlueprint(blueprint, "2026-05-07T16:00:00.000Z");

    expect(record.mode).toBe("deterministic");
    expect(record.provider).toBe("local");
    expect(record.candidateCount).toBe(3);
    expect(record.topCandidateName).toBeTruthy();
  });

  it("flags fallback when live mode is requested without an api key", () => {
    const blueprint = buildScreeningRunBlueprint(jobDescriptionRaw, "live_llm", "openai", "");

    expect(blueprint.mode).toBe("live_llm");
    expect(blueprint.provider).toBe("local");
    expect(blueprint.fallbackTriggered).toBe(true);
    expect(blueprint.fallbackReason).toContain("Cl");
    expect(blueprint.artifacts.some((artifact) => artifact.kind === "comparison")).toBe(true);
  });

  it("includes a comparison artifact in compare mode even when provider falls back", async () => {
    const blueprint = await executeScreeningRun(jobDescriptionRaw, "compare", "gemini", "");

    const comparisonArtifact = blueprint.artifacts.find((artifact) => artifact.kind === "comparison");

    expect(blueprint.mode).toBe("compare");
    expect(comparisonArtifact).toBeTruthy();
    expect(comparisonArtifact?.payload).toHaveProperty("localJob");
    expect(comparisonArtifact?.payload).toHaveProperty("providerJob");
    expect(comparisonArtifact?.payload).toHaveProperty("candidateComparisons");
    expect(
      Array.isArray((comparisonArtifact?.payload as { candidateComparisons?: unknown[] }).candidateComparisons),
    ).toBe(true);
  });
});
