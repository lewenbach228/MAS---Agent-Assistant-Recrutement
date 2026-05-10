import { candidates, drafts, evaluations, jobDescriptionRaw } from "../data/demo";
import { buildDraft, buildRecommendation, evaluateCandidate, parseJobDescription } from "./demoEngine";
import {
  analyzeCandidateStructured,
  compareJobDescriptionExtraction,
  extractJobDescriptionStructured,
  resolveProviderExecution,
} from "../infrastructure/providers/providerAdapters";
import type {
  AgentExecutionStep,
  CandidateEvaluation,
  CandidatePipelineResult,
  CandidateSubmission,
  ExecutionMode,
  JobDescriptionInput,
  ProviderKind,
  ResponseDraft,
  RunArtifact,
  RunCandidateSummary,
  RunRecord,
  ScreeningRunBlueprint,
} from "../types";

const baselineEvaluations = new Map(
  evaluations.map((evaluation) => [evaluation.candidateId, evaluation]),
);

const baselineDrafts = new Map(drafts.map((draft) => [draft.candidateId, draft]));

function fallbackEvaluation(candidate: CandidateSubmission): CandidateEvaluation {
  return {
    candidateId: candidate.id,
    overallScore: 70,
    skillScore: 68,
    experienceScore: 70,
    communicationScore: 69,
    decision: "demande de complement",
    recommendation: "",
    confidenceLabel: "à vérifier",
    strengths: ["Profil utilisateur injecté hors dataset seed"],
    gaps: ["Ajuster le scoring après revue humaine"],
    rationale: "",
    riskFlags: ["Score de base générique hors scénario seed."],
  };
}

function fallbackDraft(candidate: CandidateSubmission): ResponseDraft {
  return {
    candidateId: candidate.id,
    status: "draft",
    subject: `Suite à votre candidature - ${candidate.candidateName}`,
    body: `Bonjour ${candidate.candidateName},\n\nMerci pour votre candidature. Voici un brouillon généré à partir du pipeline local pour préparer la revue humaine.\n\nBien à vous,`,
    variables: ["candidateName"],
  };
}

function buildJobArtifact(job: JobDescriptionInput, provider: ProviderKind): RunArtifact {
  return {
    id: "artifact-job-description",
    kind: "job_description",
    title: "Fiche de poste structurée",
    candidateId: null,
    agentName: "Job Intake Agent",
    summary: `${job.title} - ${job.seniority} - ${job.requiredSkills.length} compétences requises via ${provider}`,
    payload: {
      title: job.title,
      seniority: job.seniority,
      language: job.language,
      location: job.location,
      requiredSkills: job.requiredSkills,
      bonusSkills: job.bonusSkills,
      mustHave: job.mustHave,
    },
  };
}

function buildComparisonArtifact(
  mode: ExecutionMode,
  requestedProvider: ProviderKind,
  fallbackTriggered: boolean,
  fallbackReason: string | null,
  localJob?: JobDescriptionInput,
  providerJob?: JobDescriptionInput | null,
  effectiveProvider?: ProviderKind,
  candidateComparisons: Array<{
    candidateId: string;
    candidateName: string;
    localDecision: CandidateEvaluation["decision"];
    localDraftSubject: string;
    localRank: number;
    localScore: number;
    providerDecision: CandidateEvaluation["decision"] | null;
    providerDraftSubject: string | null;
    providerRank: number | null;
    providerScore: number | null;
    scoreDelta: number | null;
  }> = [],
): RunArtifact | null {
  if (mode === "deterministic") {
    return null;
  }

  const requiredSkillsDelta =
    localJob && providerJob
      ? {
          onlyLocal: localJob.requiredSkills.filter(
            (skill) => !providerJob.requiredSkills.includes(skill),
          ),
          onlyProvider: providerJob.requiredSkills.filter(
            (skill) => !localJob.requiredSkills.includes(skill),
          ),
        }
      : null;

  return {
    id: "artifact-comparison",
    kind: "comparison",
    title: "Comparaison d'exécution",
    candidateId: null,
    agentName: "Review Gate Agent",
    summary: fallbackTriggered
      ? `Mode ${mode} demandé via ${requestedProvider}, bascule locale activée`
      : `Mode ${mode} prêt via ${requestedProvider}`,
    payload: {
      mode,
      requestedProvider,
      effectiveProvider,
      retainedRun: effectiveProvider === "local" ? "local" : "provider",
      fallbackTriggered,
      fallbackReason,
      localJob,
      providerJob,
      requiredSkillsDelta,
      candidateComparisons,
      note:
        mode === "compare"
          ? "Le mode comparaison confronte la lecture locale et provider de la fiche, puis montre l'impact candidat par candidat."
          : "Le mode direct utilise le fournisseur sur la fiche de poste et les agents candidat, puis bascule en local en cas d'erreur.",
    },
  };
}

function sortCandidateResults(
  candidateResults: CandidatePipelineResult[],
): CandidatePipelineResult[] {
  return candidateResults
    .slice()
    .sort((left, right) => right.evaluation.overallScore - left.evaluation.overallScore);
}

function buildRunSummaries(candidateResults: CandidatePipelineResult[]): RunCandidateSummary[] {
  return candidateResults.map((result) => ({
    candidateId: result.candidate.id,
    candidateName: result.candidate.candidateName,
    score: result.evaluation.overallScore,
    decision: result.evaluation.decision,
  }));
}

function buildCandidateComparisons(
  localResults: CandidatePipelineResult[],
  providerResults: CandidatePipelineResult[],
): Array<{
  candidateId: string;
  candidateName: string;
  localDecision: CandidateEvaluation["decision"];
  localDraftSubject: string;
  localRank: number;
  localScore: number;
  providerDecision: CandidateEvaluation["decision"] | null;
  providerDraftSubject: string | null;
  providerRank: number | null;
  providerScore: number | null;
  scoreDelta: number | null;
}> {
  const localRanks = new Map(localResults.map((result, index) => [result.candidate.id, index + 1]));
  const providerById = new Map(providerResults.map((result) => [result.candidate.id, result]));
  const providerRanks = new Map(
    providerResults.map((result, index) => [result.candidate.id, index + 1]),
  );

  return localResults.map((localResult) => {
    const providerResult = providerById.get(localResult.candidate.id);
    return {
      candidateId: localResult.candidate.id,
      candidateName: localResult.candidate.candidateName,
      localDecision: localResult.evaluation.decision,
      localDraftSubject: localResult.draft.subject,
      localRank: localRanks.get(localResult.candidate.id) ?? 0,
      localScore: localResult.evaluation.overallScore,
      providerDecision: providerResult?.evaluation.decision ?? null,
      providerDraftSubject: providerResult?.draft.subject ?? null,
      providerRank: providerRanks.get(localResult.candidate.id) ?? null,
      providerScore: providerResult?.evaluation.overallScore ?? null,
      scoreDelta: providerResult
        ? providerResult.evaluation.overallScore - localResult.evaluation.overallScore
        : null,
    };
  });
}

function buildCandidateArtifacts(
  candidate: CandidateSubmission,
  job: JobDescriptionInput,
  evaluation: CandidateEvaluation,
  draft: ResponseDraft,
  providerAnalysis?: {
    extractedSignals: string[];
    extractedStrengths: string[];
    extractedRisks: string[];
    matchedRequiredSkills: string[];
    missingRequiredSkills: string[];
  },
): RunArtifact[] {
  const corpus = `${candidate.emailBody} ${candidate.extractedText}`.toLowerCase();
  const matchedRequiredSkills =
    providerAnalysis?.matchedRequiredSkills ??
    job.requiredSkills.filter((skill) => corpus.includes(skill.toLowerCase()));
  const missingRequiredSkills =
    providerAnalysis?.missingRequiredSkills ??
    job.requiredSkills.filter((skill) => !corpus.includes(skill.toLowerCase()));

  return [
    {
      id: `artifact-profile-${candidate.id}`,
      kind: "candidate_profile",
      title: `Profil candidat - ${candidate.candidateName}`,
      candidateId: candidate.id,
      agentName: "Extraction Agent",
      summary: `${candidate.attachments.length} pièce(s), ${matchedRequiredSkills.length} compétence(s) visibles`,
      payload: {
        sender: candidate.sender,
        emailSubject: candidate.emailSubject,
        attachments: candidate.attachments,
        extractedText: candidate.extractedText,
        extractedSignals: providerAnalysis?.extractedSignals ?? [],
        extractedStrengths: providerAnalysis?.extractedStrengths ?? [],
        extractedRisks: providerAnalysis?.extractedRisks ?? [],
        source: candidate.source,
      },
    },
    {
      id: `artifact-match-${candidate.id}`,
      kind: "match_matrix",
      title: `Matrice de correspondance - ${candidate.candidateName}`,
      candidateId: candidate.id,
      agentName: "Match Agent",
      summary: `${matchedRequiredSkills.length} correspondance(s) requise(s), ${missingRequiredSkills.length} écart(s)`,
      payload: {
        matchedRequiredSkills,
        missingRequiredSkills,
        mustHave: job.mustHave,
        niceToHave: job.niceToHave,
      },
    },
    {
      id: `artifact-decision-${candidate.id}`,
      kind: "decision",
      title: `Décision - ${candidate.candidateName}`,
      candidateId: candidate.id,
      agentName: "Decision Agent",
      summary: `${evaluation.decision} - ${evaluation.overallScore}/100`,
      payload: {
        score: evaluation.overallScore,
        confidence: evaluation.confidenceLabel,
        recommendation: evaluation.recommendation,
        strengths: evaluation.strengths,
        gaps: evaluation.gaps,
        riskFlags: evaluation.riskFlags,
      },
    },
    {
      id: `artifact-draft-${candidate.id}`,
      kind: "response_draft",
      title: `Brouillon de réponse - ${candidate.candidateName}`,
      candidateId: candidate.id,
      agentName: "Response Draft Agent",
      summary: draft.subject,
      payload: {
        subject: draft.subject,
        body: draft.body,
        variables: draft.variables,
        status: draft.status,
      },
    },
  ];
}

function buildRunSummaryArtifact(summaries: RunCandidateSummary[], provider: ProviderKind): RunArtifact {
  return {
    id: "artifact-run-summary",
    kind: "run_summary",
    title: "Résumé du run",
    candidateId: null,
    agentName: "Review Gate Agent",
    summary: `${summaries.length} candidat(s) classés via ${provider}`,
    payload: {
      provider,
      summaries,
    },
  };
}

function buildExecutionSteps(
  mode: ExecutionMode,
  provider: ProviderKind,
  candidateResults: CandidatePipelineResult[],
  artifacts: RunArtifact[],
  fallbackTriggered: boolean,
  fallbackReason: string | null,
): AgentExecutionStep[] {
  const artifactIdByTitle = new Map(artifacts.map((artifact) => [artifact.title, artifact.id]));

  const jobStep: AgentExecutionStep = {
    id: "step-job-intake",
    candidateId: "job",
    agentName: "Job Intake Agent",
    handoffTo: "Candidate Intake Agent",
    status: "done",
    durationMs: 240,
    inputSummary: "Fiche de poste brute collée",
    outputSummary: "Structure exploitable pour la correspondance et le scoring",
    artifactLabel: "Fiche de poste structurée",
    artifactId: "artifact-job-description",
    mode,
    provider,
    fallbackUsed: fallbackTriggered,
    fallbackReason,
  };

  const candidateSteps: AgentExecutionStep[] = candidateResults.flatMap((result, index) => {
    const candidate = result.candidate;
    const evaluation = result.evaluation;
    const durationOffset = index * 18;

    return [
      {
        id: `step-${candidate.id}-candidate-intake`,
        candidateId: candidate.id,
        agentName: "Candidate Intake Agent",
        handoffTo: "Extraction Agent",
        status: "done",
        durationMs: 390 + durationOffset,
        inputSummary: `${candidate.emailSubject} - ${candidate.attachments.length} pièce(s) jointe(s)`,
        outputSummary: `Candidature normalisée pour ${candidate.candidateName}`,
        artifactLabel: "Candidature normalisée",
        artifactId: null,
        mode,
        provider,
        fallbackUsed: fallbackTriggered,
        fallbackReason,
      } satisfies AgentExecutionStep,
      {
        id: `step-${candidate.id}-extraction`,
        candidateId: candidate.id,
        agentName: "Extraction Agent",
        handoffTo: "Match Agent",
        status: "done",
        durationMs: 760 + durationOffset,
        inputSummary: "Texte de l'e-mail et texte CV",
        outputSummary: result.artifacts[0]?.summary ?? "Profil candidat extrait",
        artifactLabel: "Profil candidat",
        artifactId: artifactIdByTitle.get(`Profil candidat - ${candidate.candidateName}`) ?? null,
        mode,
        provider,
        fallbackUsed: fallbackTriggered,
        fallbackReason,
      } satisfies AgentExecutionStep,
      {
        id: `step-${candidate.id}-match`,
        candidateId: candidate.id,
        agentName: "Match Agent",
        handoffTo: "Decision Agent",
        status: "done",
        durationMs: 500 + durationOffset,
        inputSummary: "Profil candidat + fiche de poste",
        outputSummary: result.artifacts[1]?.summary ?? "Correspondance calculée",
        artifactLabel: "Matrice de correspondance",
        artifactId:
          artifactIdByTitle.get(`Matrice de correspondance - ${candidate.candidateName}`) ?? null,
        mode,
        provider,
        fallbackUsed: fallbackTriggered,
        fallbackReason,
      } satisfies AgentExecutionStep,
      {
        id: `step-${candidate.id}-decision`,
        candidateId: candidate.id,
        agentName: "Decision Agent",
        handoffTo: "Response Draft Agent",
        status: "done",
        durationMs: 360 + durationOffset,
        inputSummary: "Matrice de correspondance",
        outputSummary: `Score ${evaluation.overallScore}, ${evaluation.decision}`,
        artifactLabel: "Décision candidat",
        artifactId: artifactIdByTitle.get(`Décision - ${candidate.candidateName}`) ?? null,
        mode,
        provider,
        fallbackUsed: fallbackTriggered,
        fallbackReason,
      } satisfies AgentExecutionStep,
      {
        id: `step-${candidate.id}-draft`,
        candidateId: candidate.id,
        agentName: "Response Draft Agent",
        handoffTo: "Review Gate Agent",
        status: "review",
        durationMs: 250 + durationOffset,
        inputSummary: `Décision ${evaluation.decision}`,
        outputSummary: result.draft.subject,
        artifactLabel: "Brouillon de réponse",
        artifactId:
          artifactIdByTitle.get(`Brouillon de réponse - ${candidate.candidateName}`) ?? null,
        mode,
        provider,
        fallbackUsed: fallbackTriggered,
        fallbackReason,
      } satisfies AgentExecutionStep,
    ];
  });

  const reviewStep: AgentExecutionStep = {
    id: "step-review-gate",
    candidateId: "all",
    agentName: "Review Gate Agent",
    handoffTo: "Human reviewer",
    status: "review",
    durationMs: 180,
    inputSummary: "Classement, décisions et brouillons prêts",
    outputSummary: "Validation humaine requise avant toute action externe",
    artifactLabel: "Résumé du run",
    artifactId: "artifact-run-summary",
    mode,
    provider,
    fallbackUsed: fallbackTriggered,
    fallbackReason,
  };

  return [jobStep, ...candidateSteps, reviewStep];
}

export function buildCandidatePipelineResult(
  candidate: CandidateSubmission,
  job: JobDescriptionInput,
): CandidatePipelineResult {
  const baseline = baselineEvaluations.get(candidate.id) ?? fallbackEvaluation(candidate);
  const evaluation = evaluateCandidate(candidate, job, baseline);
  const draftBaseline = baselineDrafts.get(candidate.id) ?? fallbackDraft(candidate);
  const draft = buildDraft(candidate.candidateName, job.title, evaluation.decision, draftBaseline);
  const artifacts = buildCandidateArtifacts(candidate, job, evaluation, draft);

  return {
    candidate,
    evaluation,
    draft,
    artifacts,
  };
}

async function buildCandidatePipelineResultLive(
  candidate: CandidateSubmission,
  job: JobDescriptionInput,
  provider: Exclude<ProviderKind, "local">,
  apiKey?: string,
): Promise<CandidatePipelineResult> {
  const baseline = baselineEvaluations.get(candidate.id) ?? fallbackEvaluation(candidate);
  const fallbackEval = evaluateCandidate(candidate, job, baseline);
  const fallbackDraftBaseline = baselineDrafts.get(candidate.id) ?? fallbackDraft(candidate);
  const fallbackDraftValue = buildDraft(
    candidate.candidateName,
    job.title,
    fallbackEval.decision,
    fallbackDraftBaseline,
  );
  const fallbackArtifacts = {
    extractedSignals: [] as string[],
    extractedStrengths: fallbackEval.strengths,
    extractedRisks: fallbackEval.riskFlags,
    matchedRequiredSkills: job.requiredSkills.filter((skill) =>
      `${candidate.emailBody} ${candidate.extractedText}`.toLowerCase().includes(skill.toLowerCase()),
    ),
    missingRequiredSkills: job.requiredSkills.filter(
      (skill) =>
        !`${candidate.emailBody} ${candidate.extractedText}`.toLowerCase().includes(skill.toLowerCase()),
    ),
  };

  const providerAnalysis = await analyzeCandidateStructured(
    job,
    candidate,
    provider,
    apiKey,
    {
      artifacts: fallbackArtifacts,
      draft: fallbackDraftValue,
      evaluation: fallbackEval,
    },
  );

  const evaluation: CandidateEvaluation = {
    ...fallbackEval,
    ...providerAnalysis.evaluation,
    candidateId: candidate.id,
    recommendation: buildRecommendation(
      providerAnalysis.evaluation.decision,
      candidate.candidateName,
      job.title,
    ),
  };

  const alignedDraft = buildDraft(
    candidate.candidateName,
    job.title,
    evaluation.decision,
    fallbackDraftBaseline,
  );
  const draft: ResponseDraft =
    providerAnalysis.evaluation.decision === fallbackEval.decision
      ? {
          ...alignedDraft,
          subject: providerAnalysis.draft.subject,
          body: providerAnalysis.draft.body,
          variables: providerAnalysis.draft.variables,
        }
      : alignedDraft;

  const artifacts = buildCandidateArtifacts(candidate, job, evaluation, draft, providerAnalysis.artifacts);

  return {
    candidate,
    evaluation,
    draft,
    artifacts,
  };
}

function buildScreeningRunBlueprintFromResolvedJob(
  job: JobDescriptionInput,
  mode: ExecutionMode,
  effectiveProvider: ProviderKind,
  requestedProvider: ProviderKind,
  fallbackTriggered: boolean,
  fallbackReason: string | null,
  runtimeCandidates: CandidateSubmission[],
  localJob?: JobDescriptionInput,
  providerJob?: JobDescriptionInput | null,
): ScreeningRunBlueprint {
  const candidateResults = sortCandidateResults(
    runtimeCandidates.map((candidate) => buildCandidatePipelineResult(candidate, job)),
  );

  const summaries = buildRunSummaries(candidateResults);

  const comparisonArtifact = buildComparisonArtifact(
    mode,
    requestedProvider,
    fallbackTriggered,
    fallbackReason,
    localJob,
    providerJob,
    effectiveProvider,
    [],
  );

  const artifacts = [
    buildJobArtifact(job, effectiveProvider),
    ...candidateResults.flatMap((result) => result.artifacts),
    ...(comparisonArtifact ? [comparisonArtifact] : []),
    buildRunSummaryArtifact(summaries, effectiveProvider),
  ];

  const steps = buildExecutionSteps(
    mode,
    effectiveProvider,
    candidateResults,
    artifacts,
    fallbackTriggered,
    fallbackReason,
  );

  return {
    mode,
    provider: effectiveProvider,
    fallbackTriggered,
    fallbackReason,
    job,
    candidateResults,
    steps,
    artifacts,
    summaries,
  };
}

export function buildScreeningRunBlueprint(
  jobDescriptionText: string,
  mode: ExecutionMode = "deterministic",
  provider: ProviderKind = "local",
  apiKey?: string,
  runtimeCandidates: CandidateSubmission[] = candidates,
): ScreeningRunBlueprint {
  const resolution = resolveProviderExecution({ mode, provider, apiKey });
  const job = parseJobDescription(jobDescriptionText || jobDescriptionRaw);
  return buildScreeningRunBlueprintFromResolvedJob(
    job,
    resolution.selectedMode,
    resolution.effectiveProvider,
    resolution.requestedProvider,
    resolution.fallbackTriggered,
    resolution.fallbackReason,
    runtimeCandidates,
    job,
    null,
  );
}

export async function executeScreeningRun(
  jobDescriptionText: string,
  mode: ExecutionMode = "deterministic",
  provider: ProviderKind = "local",
  apiKey?: string,
  runtimeCandidates: CandidateSubmission[] = candidates,
): Promise<ScreeningRunBlueprint> {
  if (mode === "deterministic") {
    return buildScreeningRunBlueprint(
      jobDescriptionText,
      mode,
      provider,
      apiKey,
      runtimeCandidates,
    );
  }

  if (mode === "compare" && provider !== "local") {
    const comparison = await compareJobDescriptionExtraction(jobDescriptionText, provider, apiKey);
    const localResults = sortCandidateResults(
      runtimeCandidates.map((candidate) =>
        buildCandidatePipelineResult(candidate, comparison.localJob),
      ),
    );
    const providerResults = sortCandidateResults(
      await Promise.all(
        runtimeCandidates.map((candidate) =>
          buildCandidatePipelineResultLive(candidate, comparison.effectiveJob, provider, apiKey),
        ),
      ),
    );
    const activeResults =
      comparison.effectiveProvider === "local" ? localResults : providerResults;
    const summaries = buildRunSummaries(activeResults);
    const comparisonArtifact = buildComparisonArtifact(
      mode,
      provider,
      comparison.fallbackTriggered,
      comparison.fallbackReason,
      comparison.localJob,
      comparison.providerJob,
      comparison.effectiveProvider,
      buildCandidateComparisons(localResults, providerResults),
    );
    const artifacts = [
      buildJobArtifact(comparison.effectiveJob, comparison.effectiveProvider),
      ...activeResults.flatMap((result) => result.artifacts),
      ...(comparisonArtifact ? [comparisonArtifact] : []),
      buildRunSummaryArtifact(summaries, comparison.effectiveProvider),
    ];
    const steps = buildExecutionSteps(
      mode,
      comparison.effectiveProvider,
      activeResults,
      artifacts,
      comparison.fallbackTriggered,
      comparison.fallbackReason,
    );
    return {
      mode,
      provider: comparison.effectiveProvider,
      fallbackTriggered: comparison.fallbackTriggered,
      fallbackReason: comparison.fallbackReason,
      job: comparison.effectiveJob,
      candidateResults: activeResults,
      steps,
      artifacts,
      summaries,
    };
  }

  const resolution = resolveProviderExecution({ mode, provider, apiKey });
  const extraction = await extractJobDescriptionStructured(jobDescriptionText, {
    mode,
    provider,
    apiKey,
  });

  if (extraction.provider === "local") {
    return buildScreeningRunBlueprintFromResolvedJob(
      extraction.job,
      resolution.selectedMode,
      extraction.provider,
      resolution.requestedProvider,
      extraction.fallbackTriggered,
      extraction.fallbackReason,
      runtimeCandidates,
      parseJobDescription(jobDescriptionText || jobDescriptionRaw),
      extraction.provider === "local" ? null : extraction.job,
    );
  }

  const candidateResults = sortCandidateResults(
    await Promise.all(
      runtimeCandidates.map((candidate) =>
        buildCandidatePipelineResultLive(
          candidate,
          extraction.job,
          extraction.provider as Exclude<ProviderKind, "local">,
          apiKey,
        ),
      ),
    ),
  );
  const summaries = buildRunSummaries(candidateResults);
  const comparisonArtifact = buildComparisonArtifact(
    mode,
    resolution.requestedProvider,
    extraction.fallbackTriggered,
    extraction.fallbackReason,
    parseJobDescription(jobDescriptionText || jobDescriptionRaw),
    extraction.job,
    extraction.provider,
  );
  const artifacts = [
    buildJobArtifact(extraction.job, extraction.provider),
    ...candidateResults.flatMap((result) => result.artifacts),
    ...(comparisonArtifact ? [comparisonArtifact] : []),
    buildRunSummaryArtifact(summaries, extraction.provider),
  ];
  const steps = buildExecutionSteps(
    resolution.selectedMode,
    extraction.provider,
    candidateResults,
    artifacts,
    extraction.fallbackTriggered,
    extraction.fallbackReason,
  );

  return {
    mode: resolution.selectedMode,
    provider: extraction.provider,
    fallbackTriggered: extraction.fallbackTriggered,
    fallbackReason: extraction.fallbackReason,
    job: extraction.job,
    candidateResults,
    steps,
    artifacts,
    summaries,
  };
}

export function buildRunRecordFromBlueprint(
  blueprint: ScreeningRunBlueprint,
  ranAt: string,
): RunRecord {
  return {
    id: `run-${ranAt}`,
    ranAt,
    candidateCount: blueprint.summaries.length,
    topCandidateName: blueprint.summaries[0]?.candidateName ?? "n/a",
    topScore: blueprint.summaries[0]?.score ?? 0,
    mode: blueprint.mode,
    provider: blueprint.provider,
    summaries: blueprint.summaries,
  };
}
