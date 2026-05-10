export type CandidateDecision =
  | "acceptation shortlist"
  | "refus"
  | "demande de complement";

export type AgentStatus = "done" | "review" | "blocked";

export type ProviderName = "openai" | "gemini";

export type ExecutionMode = "deterministic" | "live_llm" | "compare";

export type ProviderKind = "local" | ProviderName;

export type AgentName =
  | "Job Intake Agent"
  | "Candidate Intake Agent"
  | "Extraction Agent"
  | "Match Agent"
  | "Decision Agent"
  | "Response Draft Agent"
  | "Review Gate Agent";

export type ArtifactKind =
  | "job_description"
  | "candidate_profile"
  | "match_matrix"
  | "decision"
  | "response_draft"
  | "run_summary"
  | "comparison";

export interface JobDescriptionInput {
  title: string;
  missions: string[];
  requiredSkills: string[];
  bonusSkills: string[];
  seniority: string;
  language: string;
  location: string;
  mustHave: string[];
  niceToHave: string[];
}

export interface CandidateSubmission {
  id: string;
  candidateName: string;
  emailSubject: string;
  sender: string;
  receivedAt: string;
  source: "seed" | "gmail" | "imap";
  emailBody: string;
  attachments: string[];
  extractedText: string;
}

export interface CandidateEvaluation {
  candidateId: string;
  overallScore: number;
  skillScore: number;
  experienceScore: number;
  communicationScore: number;
  decision: CandidateDecision;
  recommendation: string;
  confidenceLabel: "haute" | "moyenne" | "à vérifier";
  strengths: string[];
  gaps: string[];
  rationale: string;
  riskFlags: string[];
}

export interface AgentRunTrace {
  candidateId: string;
  agentName: AgentName;
  handoffTo: string;
  status: AgentStatus;
  durationMs: number;
  inputSummary: string;
  outputSummary: string;
  artifactLabel: string;
}

export interface ResponseDraft {
  candidateId: string;
  status: "draft" | "reviewed" | "sent";
  subject: string;
  body: string;
  variables: string[];
}

export interface PlaygroundProviderConfig {
  provider: ProviderName;
  model: string;
  apiKeyLabel: string;
  usageNote: string;
}

export interface RunCandidateSummary {
  candidateId: string;
  candidateName: string;
  score: number;
  decision: CandidateDecision;
}

export interface RunRecord {
  id: string;
  ranAt: string;
  candidateCount: number;
  topCandidateName: string;
  topScore: number;
  mode: ExecutionMode;
  provider: ProviderKind;
  summaries: RunCandidateSummary[];
}

export interface RunArtifact {
  id: string;
  kind: ArtifactKind;
  title: string;
  candidateId: string | null;
  agentName: AgentName | null;
  summary: string;
  payload: Record<string, unknown>;
}

export interface AgentExecutionStep extends AgentRunTrace {
  id: string;
  artifactId: string | null;
  mode: ExecutionMode;
  provider: ProviderKind;
  fallbackUsed: boolean;
  fallbackReason: string | null;
}

export interface CandidatePipelineResult {
  candidate: CandidateSubmission;
  evaluation: CandidateEvaluation;
  draft: ResponseDraft;
  artifacts: RunArtifact[];
}

export interface ScreeningRunBlueprint {
  mode: ExecutionMode;
  provider: ProviderKind;
  fallbackTriggered: boolean;
  fallbackReason: string | null;
  job: JobDescriptionInput;
  candidateResults: CandidatePipelineResult[];
  steps: AgentExecutionStep[];
  artifacts: RunArtifact[];
  summaries: RunCandidateSummary[];
}
