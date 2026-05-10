import type {
  CandidateDecision,
  CandidateEvaluation,
  CandidateSubmission,
  ExecutionMode,
  JobDescriptionInput,
  ProviderKind,
  ResponseDraft,
} from "../../types";
import { parseJobDescription } from "../../lib/demoEngine";

export interface ProviderExecutionRequest {
  mode: ExecutionMode;
  provider: ProviderKind;
  apiKey?: string;
}

export interface ProviderExecutionResolution {
  selectedMode: ExecutionMode;
  requestedProvider: ProviderKind;
  effectiveProvider: ProviderKind;
  providerReady: boolean;
  fallbackTriggered: boolean;
  fallbackReason: string | null;
}

export interface StructuredJobExtractionResult {
  job: JobDescriptionInput;
  provider: ProviderKind;
  fallbackTriggered: boolean;
  fallbackReason: string | null;
}

export interface JobExtractionComparisonResult {
  localJob: JobDescriptionInput;
  providerJob: JobDescriptionInput | null;
  effectiveJob: JobDescriptionInput;
  effectiveProvider: ProviderKind;
  fallbackTriggered: boolean;
  fallbackReason: string | null;
}

export interface ProviderCandidateArtifacts {
  extractedSignals: string[];
  extractedStrengths: string[];
  extractedRisks: string[];
  matchedRequiredSkills: string[];
  missingRequiredSkills: string[];
}

export interface ProviderCandidateAnalysisResult {
  artifacts: ProviderCandidateArtifacts;
  draft: {
    body: string;
    subject: string;
    variables: string[];
  };
  evaluation: {
    communicationScore: number;
    confidenceLabel: CandidateEvaluation["confidenceLabel"];
    decision: CandidateDecision;
    experienceScore: number;
    gaps: string[];
    overallScore: number;
    rationale: string;
    recommendation: string;
    riskFlags: string[];
    skillScore: number;
    strengths: string[];
  };
  fallbackReason: string | null;
  fallbackTriggered: boolean;
  provider: ProviderKind;
}

export interface CoercedProviderEvaluation {
  confidenceLabel: CandidateEvaluation["confidenceLabel"];
  decision: CandidateDecision;
}

const jobDescriptionSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "title",
    "missions",
    "requiredSkills",
    "bonusSkills",
    "seniority",
    "language",
    "location",
    "mustHave",
    "niceToHave",
  ],
  properties: {
    title: { type: "string" },
    missions: { type: "array", items: { type: "string" } },
    requiredSkills: { type: "array", items: { type: "string" } },
    bonusSkills: { type: "array", items: { type: "string" } },
    seniority: { type: "string" },
    language: { type: "string" },
    location: { type: "string" },
    mustHave: { type: "array", items: { type: "string" } },
    niceToHave: { type: "array", items: { type: "string" } },
  },
} as const;

const candidateAnalysisSchema = {
  type: "object",
  additionalProperties: false,
  required: ["artifacts", "evaluation", "draft"],
  properties: {
    artifacts: {
      type: "object",
      additionalProperties: false,
      required: [
        "extractedSignals",
        "extractedStrengths",
        "extractedRisks",
        "matchedRequiredSkills",
        "missingRequiredSkills",
      ],
      properties: {
        extractedSignals: { type: "array", items: { type: "string" } },
        extractedStrengths: { type: "array", items: { type: "string" } },
        extractedRisks: { type: "array", items: { type: "string" } },
        matchedRequiredSkills: { type: "array", items: { type: "string" } },
        missingRequiredSkills: { type: "array", items: { type: "string" } },
      },
    },
    evaluation: {
      type: "object",
      additionalProperties: false,
      required: [
        "overallScore",
        "skillScore",
        "experienceScore",
        "communicationScore",
        "decision",
        "recommendation",
        "confidenceLabel",
        "strengths",
        "gaps",
        "rationale",
        "riskFlags",
      ],
      properties: {
        overallScore: { type: "number" },
        skillScore: { type: "number" },
        experienceScore: { type: "number" },
        communicationScore: { type: "number" },
        decision: {
          type: "string",
          enum: ["acceptation shortlist", "refus", "demande de complement"],
        },
        recommendation: { type: "string" },
        confidenceLabel: {
          type: "string",
          enum: ["haute", "moyenne", "à vérifier"],
        },
        strengths: { type: "array", items: { type: "string" } },
        gaps: { type: "array", items: { type: "string" } },
        rationale: { type: "string" },
        riskFlags: { type: "array", items: { type: "string" } },
      },
    },
    draft: {
      type: "object",
      additionalProperties: false,
      required: ["subject", "body", "variables"],
      properties: {
        subject: { type: "string" },
        body: { type: "string" },
        variables: { type: "array", items: { type: "string" } },
      },
    },
  },
} as const;

function sanitizeJobDescription(value: unknown, fallbackRaw: string): JobDescriptionInput {
  const fallback = parseJobDescription(fallbackRaw);

  if (!value || typeof value !== "object") {
    return fallback;
  }

  const record = value as Record<string, unknown>;

  const readString = (raw: unknown, fallbackValue: string, maxLength = 140) =>
    typeof raw === "string" && raw.trim() ? raw.trim().slice(0, maxLength) : fallbackValue;

  const readList = (raw: unknown, fallbackValue: string[], limit: number) => {
    if (!Array.isArray(raw)) {
      return fallbackValue;
    }

    const cleaned = raw
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, limit);

    return cleaned.length ? cleaned : fallbackValue;
  };

  return {
    title: readString(record.title, fallback.title),
    missions: readList(record.missions, fallback.missions, 6),
    requiredSkills: readList(record.requiredSkills, fallback.requiredSkills, 10),
    bonusSkills: readList(record.bonusSkills, fallback.bonusSkills, 10),
    seniority: readString(record.seniority, fallback.seniority, 80),
    language: readString(record.language, fallback.language, 80),
    location: readString(record.location, fallback.location, 80),
    mustHave: readList(record.mustHave, fallback.mustHave, 8),
    niceToHave: readList(record.niceToHave, fallback.niceToHave, 8),
  };
}

function extractJsonObject(raw: string) {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Aucun objet JSON detecte dans la reponse du fournisseur.");
  }

  return JSON.parse(raw.slice(start, end + 1));
}

function clampScore(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(20, Math.min(99, Math.round(value)))
    : fallback;
}

export function coerceProviderEvaluation(
  overallScore: number,
  missingRequiredSkillsCount: number,
): CoercedProviderEvaluation {
  const decision: CandidateDecision =
    overallScore >= 80 && missingRequiredSkillsCount <= 1
      ? "acceptation shortlist"
      : overallScore >= 68
        ? "demande de complement"
        : "refus";

  const confidenceLabel: CandidateEvaluation["confidenceLabel"] =
    overallScore >= 85 && missingRequiredSkillsCount <= 1
      ? "haute"
      : overallScore >= 68
        ? "à vérifier"
        : "moyenne";

  return { decision, confidenceLabel };
}

function sanitizeCandidateAnalysis(
  value: unknown,
  fallback: {
    artifacts: ProviderCandidateArtifacts;
    draft: ResponseDraft;
    evaluation: CandidateEvaluation;
  },
): ProviderCandidateAnalysisResult {
  const safeList = (raw: unknown, fallbackValue: string[], limit = 6) =>
    Array.isArray(raw)
      ? raw
          .filter((item): item is string => typeof item === "string")
          .map((item) => item.trim())
          .filter(Boolean)
          .slice(0, limit)
      : fallbackValue;

  const safeString = (raw: unknown, fallbackValue: string, max = 320) =>
    typeof raw === "string" && raw.trim() ? raw.trim().slice(0, max) : fallbackValue;

  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const artifacts = record.artifacts as Record<string, unknown> | undefined;
  const evaluation = record.evaluation as Record<string, unknown> | undefined;
  const draft = record.draft as Record<string, unknown> | undefined;

  const matchedRequiredSkills = safeList(
    artifacts?.matchedRequiredSkills,
    fallback.artifacts.matchedRequiredSkills,
    10,
  );
  const missingRequiredSkills = safeList(
    artifacts?.missingRequiredSkills,
    fallback.artifacts.missingRequiredSkills,
    10,
  );
  const overallScore = clampScore(evaluation?.overallScore, fallback.evaluation.overallScore);
  const skillScore = clampScore(evaluation?.skillScore, fallback.evaluation.skillScore);
  const experienceScore = clampScore(
    evaluation?.experienceScore,
    fallback.evaluation.experienceScore,
  );
  const communicationScore = clampScore(
    evaluation?.communicationScore,
    fallback.evaluation.communicationScore,
  );
  const coerced = coerceProviderEvaluation(overallScore, missingRequiredSkills.length);

  return {
    provider: "local",
    fallbackTriggered: false,
    fallbackReason: null,
    artifacts: {
      extractedSignals: safeList(artifacts?.extractedSignals, fallback.artifacts.extractedSignals),
      extractedStrengths: safeList(
        artifacts?.extractedStrengths,
        fallback.artifacts.extractedStrengths,
      ),
      extractedRisks: safeList(artifacts?.extractedRisks, fallback.artifacts.extractedRisks),
      matchedRequiredSkills,
      missingRequiredSkills,
    },
    evaluation: {
      overallScore,
      skillScore,
      experienceScore,
      communicationScore,
      decision: coerced.decision,
      recommendation: safeString(
        evaluation?.recommendation,
        fallback.evaluation.recommendation,
        240,
      ),
      confidenceLabel: coerced.confidenceLabel,
      strengths: safeList(evaluation?.strengths, fallback.evaluation.strengths),
      gaps: safeList(evaluation?.gaps, fallback.evaluation.gaps),
      rationale: safeString(evaluation?.rationale, fallback.evaluation.rationale, 400),
      riskFlags: safeList(evaluation?.riskFlags, fallback.evaluation.riskFlags),
    },
    draft: {
      subject: safeString(draft?.subject, fallback.draft.subject, 160),
      body: safeString(draft?.body, fallback.draft.body, 1200),
      variables: safeList(draft?.variables, fallback.draft.variables, 8),
    },
  };
}

async function extractWithOpenAI(raw: string, apiKey: string): Promise<JobDescriptionInput> {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      input: [
        {
          role: "system",
          content: "Return a valid JSON object that structures a job description. JSON only.",
        },
        {
          role: "user",
          content: `Structure cette fiche de poste en JSON strict.\n\n${raw}`,
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "job_description",
          strict: true,
          schema: jobDescriptionSchema,
        },
      },
    }),
  });

  if (!response.ok) {
    let detail = "";

    try {
      const data = (await response.json()) as {
        error?: {
          message?: string;
        };
      };
      detail = data.error?.message ? ` ${data.error.message}` : "";
    } catch {
      // Ignore non-JSON error bodies.
    }

    throw new Error(`OpenAI a repondu ${response.status}.${detail}`);
  }

  const data = (await response.json()) as {
    output?: Array<{
      type: string;
      content?: Array<
        | { type: "output_text"; text: string }
        | { type: "refusal"; refusal: string }
      >;
    }>;
  };

  const message = data.output?.find((item) => item.type === "message");
  const refusal = message?.content?.find((item) => item.type === "refusal");
  if (refusal && "refusal" in refusal) {
    throw new Error(`OpenAI refusal: ${refusal.refusal}`);
  }

  const text = message?.content
    ?.filter((item): item is { type: "output_text"; text: string } => item.type === "output_text")
    .map((item) => item.text)
    .join("\n");

  if (!text) {
    throw new Error("OpenAI n'a pas retourne de texte JSON.");
  }

  return sanitizeJobDescription(extractJsonObject(text), raw);
}

async function extractWithGemini(raw: string, apiKey: string): Promise<JobDescriptionInput> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Return a strict JSON object that structures this job description.\n\n${raw}`,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseJsonSchema: jobDescriptionSchema,
        },
      }),
    },
  );

  if (!response.ok) {
    let detail = "";

    try {
      const data = (await response.json()) as {
        error?: {
          message?: string;
        };
      };
      detail = data.error?.message ? ` ${data.error.message}` : "";
    } catch {
      // Ignore non-JSON error bodies.
    }

    throw new Error(`Gemini a repondu ${response.status}.${detail}`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>;
      };
    }>;
  };

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini n'a pas retourne de texte JSON.");
  }

  return sanitizeJobDescription(extractJsonObject(text), raw);
}

async function analyzeCandidateWithOpenAI(
  apiKey: string,
  job: JobDescriptionInput,
  candidate: CandidateSubmission,
): Promise<ProviderCandidateAnalysisResult> {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      input: [
        {
          role: "system",
          content:
            "You are an evaluation agent for recruiter screening. Return strict JSON only.",
        },
        {
          role: "user",
          content: `Analyse cette candidature pour ce poste. Retourne uniquement le JSON.\n\nPOSTE:\n${JSON.stringify(job)}\n\nCANDIDAT:\n${JSON.stringify(candidate)}`,
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "candidate_analysis",
          strict: true,
          schema: candidateAnalysisSchema,
        },
      },
    }),
  });

  if (!response.ok) {
    let detail = "";
    try {
      const data = (await response.json()) as { error?: { message?: string } };
      detail = data.error?.message ? ` ${data.error.message}` : "";
    } catch {
      // Ignore non-JSON error bodies.
    }
    throw new Error(`OpenAI a repondu ${response.status}.${detail}`);
  }

  const data = (await response.json()) as {
    output?: Array<{
      type: string;
      content?: Array<{ type: "output_text"; text: string } | { type: "refusal"; refusal: string }>;
    }>;
  };

  const message = data.output?.find((item) => item.type === "message");
  const refusal = message?.content?.find((item) => item.type === "refusal");
  if (refusal && "refusal" in refusal) {
    throw new Error(`OpenAI refusal: ${refusal.refusal}`);
  }

  const text = message?.content
    ?.filter((item): item is { type: "output_text"; text: string } => item.type === "output_text")
    .map((item) => item.text)
    .join("\n");

  if (!text) {
    throw new Error("OpenAI n'a pas retourne de texte JSON.");
  }

  return extractJsonObject(text) as ProviderCandidateAnalysisResult;
}

async function analyzeCandidateWithGemini(
  apiKey: string,
  job: JobDescriptionInput,
  candidate: CandidateSubmission,
): Promise<ProviderCandidateAnalysisResult> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Analyse cette candidature pour ce poste. Retourne uniquement un JSON strict.\n\nPOSTE:\n${JSON.stringify(job)}\n\nCANDIDAT:\n${JSON.stringify(candidate)}`,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseJsonSchema: candidateAnalysisSchema,
        },
      }),
    },
  );

  if (!response.ok) {
    let detail = "";
    try {
      const data = (await response.json()) as { error?: { message?: string } };
      detail = data.error?.message ? ` ${data.error.message}` : "";
    } catch {
      // Ignore non-JSON error bodies.
    }
    throw new Error(`Gemini a repondu ${response.status}.${detail}`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>;
      };
    }>;
  };

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini n'a pas retourne de texte JSON.");
  }

  return extractJsonObject(text) as ProviderCandidateAnalysisResult;
}

export function resolveProviderExecution(
  request: ProviderExecutionRequest,
): ProviderExecutionResolution {
  if (request.mode === "deterministic") {
    return {
      selectedMode: request.mode,
      requestedProvider: request.provider,
      effectiveProvider: "local",
      providerReady: true,
      fallbackTriggered: false,
      fallbackReason: null,
    };
  }

  if (!request.apiKey?.trim()) {
    return {
      selectedMode: request.mode,
      requestedProvider: request.provider,
      effectiveProvider: "local",
      providerReady: false,
      fallbackTriggered: true,
      fallbackReason: "Clé API absente : bascule locale activée.",
    };
  }

  return {
    selectedMode: request.mode,
    requestedProvider: request.provider,
    effectiveProvider: request.provider,
    providerReady: true,
    fallbackTriggered: false,
    fallbackReason: null,
  };
}

export async function extractJobDescriptionStructured(
  raw: string,
  request: ProviderExecutionRequest,
): Promise<StructuredJobExtractionResult> {
  const resolution = resolveProviderExecution(request);

  if (resolution.effectiveProvider === "local") {
    return {
      job: parseJobDescription(raw),
      provider: "local",
      fallbackTriggered: resolution.fallbackTriggered,
      fallbackReason: resolution.fallbackReason,
    };
  }

  try {
    const job =
      resolution.effectiveProvider === "openai"
        ? await extractWithOpenAI(raw, request.apiKey ?? "")
        : await extractWithGemini(raw, request.apiKey ?? "");

    return {
      job,
      provider: resolution.effectiveProvider,
      fallbackTriggered: false,
      fallbackReason: null,
    };
  } catch (error) {
    return {
      job: parseJobDescription(raw),
      provider: "local",
      fallbackTriggered: true,
      fallbackReason:
        error instanceof Error
          ? `${error.message} Bascule locale activee.`
          : "Erreur fournisseur. Bascule locale activee.",
    };
  }
}

export async function compareJobDescriptionExtraction(
  raw: string,
  provider: Exclude<ProviderKind, "local">,
  apiKey?: string,
): Promise<JobExtractionComparisonResult> {
  const localJob = parseJobDescription(raw);
  const providerResult = await extractJobDescriptionStructured(raw, {
    mode: "live_llm",
    provider,
    apiKey,
  });

  if (providerResult.provider === "local") {
    return {
      localJob,
      providerJob: null,
      effectiveJob: localJob,
      effectiveProvider: "local",
      fallbackTriggered: providerResult.fallbackTriggered,
      fallbackReason: providerResult.fallbackReason,
    };
  }

  return {
    localJob,
    providerJob: providerResult.job,
    effectiveJob: providerResult.job,
    effectiveProvider: providerResult.provider,
    fallbackTriggered: false,
    fallbackReason: null,
  };
}

export async function analyzeCandidateStructured(
  job: JobDescriptionInput,
  candidate: CandidateSubmission,
  provider: Exclude<ProviderKind, "local">,
  apiKey: string | undefined,
  fallback: {
    artifacts: ProviderCandidateArtifacts;
    draft: ResponseDraft;
    evaluation: CandidateEvaluation;
  },
): Promise<ProviderCandidateAnalysisResult> {
  const resolution = resolveProviderExecution({
    mode: "live_llm",
    provider,
    apiKey,
  });

  if (resolution.effectiveProvider === "local") {
    return {
      ...sanitizeCandidateAnalysis({}, fallback),
      provider: "local",
      fallbackTriggered: true,
      fallbackReason: resolution.fallbackReason,
    };
  }

  try {
    const analysis =
      resolution.effectiveProvider === "openai"
        ? await analyzeCandidateWithOpenAI(apiKey ?? "", job, candidate)
        : await analyzeCandidateWithGemini(apiKey ?? "", job, candidate);

    return {
      ...sanitizeCandidateAnalysis(analysis, fallback),
      provider: resolution.effectiveProvider,
      fallbackTriggered: false,
      fallbackReason: null,
    };
  } catch (error) {
    return {
      ...sanitizeCandidateAnalysis({}, fallback),
      provider: "local",
      fallbackTriggered: true,
      fallbackReason:
        error instanceof Error
          ? `${error.message} Bascule locale activee.`
          : "Erreur fournisseur. Bascule locale activee.",
    };
  }
}
