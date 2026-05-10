import { describe, expect, it } from "vitest";
import { candidates, evaluations, jobDescriptionRaw } from "../src/data/demo";
import { buildDraft, evaluateCandidate, parseJobDescription } from "../src/lib/demoEngine";

describe("demoEngine", () => {
  it("parses a raw job description into structured fields", () => {
    const parsed = parseJobDescription(jobDescriptionRaw);

    expect(parsed.title).toContain("Product Engineer IA");
    expect(parsed.requiredSkills).toContain("React");
    expect(parsed.mustHave.length).toBeGreaterThan(0);
  });

  it("keeps the strongest seeded candidate above the backend-oriented one", () => {
    const parsed = parseJobDescription(jobDescriptionRaw);
    const ada = evaluateCandidate(candidates[0], parsed, evaluations[0]);
    const lucas = evaluateCandidate(candidates[1], parsed, evaluations[1]);

    expect(ada.overallScore).toBeGreaterThan(lucas.overallScore);
    expect(ada.decision).toBe("acceptation shortlist");
    expect(lucas.decision).toBe("refus");
  });

  it("produces a complement request draft when the decision requires more proof", () => {
    const draft = buildDraft(
      "Sarah Klein",
      "Product Engineer IA",
      "demande de complement",
      {
        candidateId: "cand-sarah",
        status: "draft",
        subject: "",
        body: "",
        variables: [],
      },
    );

    expect(draft.subject).toContain("Informations complémentaires");
    expect(draft.body).toContain("portfolio");
  });
});
