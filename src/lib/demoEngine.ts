import { jobDescription } from "../data/demo";
import type {
  CandidateDecision,
  CandidateEvaluation,
  CandidateSubmission,
  JobDescriptionInput,
  ResponseDraft,
} from "../types";

export function normalize(value: string) {
  return value.toLowerCase();
}

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function splitBulletBlock(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean);
}

export function extractSection(raw: string, label: string) {
  const labels = [label, stripAccents(label)].filter((value, index, array) => array.indexOf(value) === index);

  for (const currentLabel of labels) {
    const escaped = currentLabel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`${escaped}\\s*:\\s*([\\s\\S]*?)(?=\\n[A-Za-zÀ-ÿ][^\\n]*:\\s*|$)`, "i");
    const match = raw.match(regex)?.[1]?.trim();
    if (match) {
      return match;
    }
  }

  return "";
}

export function extractInline(raw: string, label: string, fallback: string) {
  const labels = [label, stripAccents(label)].filter((value, index, array) => array.indexOf(value) === index);

  for (const currentLabel of labels) {
    const escaped = currentLabel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`${escaped}\\s*:\\s*(.+)`, "i");
    const match = raw.match(regex)?.[1]?.trim();
    if (match) {
      return match;
    }
  }

  return fallback;
}

function stripAccents(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function parseJobDescription(raw: string): JobDescriptionInput {
  return {
    title: extractInline(raw, "Titre", jobDescription.title),
    seniority: extractInline(raw, "Seniorité", jobDescription.seniority),
    language: extractInline(raw, "Langue", jobDescription.language),
    location: extractInline(raw, "Localisation", jobDescription.location),
    missions: splitBulletBlock(extractSection(raw, "Missions")).slice(0, 6),
    requiredSkills: splitBulletBlock(extractSection(raw, "Compétences requises")).slice(0, 10),
    bonusSkills: splitBulletBlock(extractSection(raw, "Compétences bonus")).slice(0, 10),
    mustHave: splitBulletBlock(extractSection(raw, "Must-have")).slice(0, 8),
    niceToHave: splitBulletBlock(extractSection(raw, "Nice-to-have")).slice(0, 8),
  };
}

export function detectYears(text: string) {
  const match = text.match(/(\d+)\s*(ans|years)/i);
  return match ? Number(match[1]) : null;
}

export function detectTargetYears(seniority: string) {
  const match = seniority.match(/(\d+)/);
  return match ? Number(match[1]) : 3;
}

export function buildRecommendation(
  decision: CandidateDecision,
  candidateName: string,
  title: string,
) {
  if (decision === "acceptation shortlist") {
    return `Passer ${candidateName} en présélection et proposer un entretien ciblé sur ${title}.`;
  }

  if (decision === "demande de complement") {
    return `Demander des preuves complémentaires à ${candidateName} avant de statuer sur ${title}.`;
  }

  return `Refuser poliment ${candidateName} car le niveau d'alignement avec ${title} reste insuffisant.`;
}

export function buildDraft(
  candidateName: string,
  title: string,
  decision: CandidateDecision,
  fallbackDraft: ResponseDraft,
): ResponseDraft {
  if (decision === "acceptation shortlist") {
    return {
      candidateId: fallbackDraft.candidateId,
      status: "draft",
      subject: `Suite à votre candidature - entretien pour ${title}`,
      body: `Bonjour ${candidateName},\n\nMerci pour votre candidature. Votre profil ressort comme un bon match pour ${title}. Nous aimerions vous proposer un entretien court afin de revenir sur votre expérience récente et vos choix techniques.\n\nBien à vous,`,
      variables: ["candidateName", "jobTitle", "interviewSlot"],
    };
  }

  if (decision === "demande de complement") {
    return {
      candidateId: fallbackDraft.candidateId,
      status: "draft",
      subject: `Informations complémentaires - ${title}`,
      body: `Bonjour ${candidateName},\n\nMerci pour votre candidature. Avant de prendre une décision finale sur ${title}, pourriez-vous partager votre portfolio, un projet représentatif et quelques détails sur votre expérience la plus proche du poste ?\n\nMerci d'avance,`,
      variables: ["candidateName", "jobTitle", "requestedArtifacts"],
    };
  }

  return {
    candidateId: fallbackDraft.candidateId,
    status: "draft",
    subject: `Suite à votre candidature - ${title}`,
    body: `Bonjour ${candidateName},\n\nMerci pour l'intérêt porté à ${title}. Après revue, nous ne poursuivons pas sur ce rôle car l'alignement avec les priorités produit, interface et orchestration du poste reste partiel.\n\nNous vous souhaitons une bonne continuation.`,
    variables: ["candidateName", "jobTitle"],
  };
}

export function evaluateCandidate(
  candidate: CandidateSubmission,
  currentJob: JobDescriptionInput,
  baseline: CandidateEvaluation,
): CandidateEvaluation {
  const corpus = normalize(`${candidate.emailBody} ${candidate.extractedText}`);

  const matchedRequiredSkills = currentJob.requiredSkills.filter((skill) =>
    corpus.includes(normalize(skill)),
  );
  const missingRequiredSkills = currentJob.requiredSkills.filter(
    (skill) => !corpus.includes(normalize(skill)),
  );
  const matchedBonusSkills = currentJob.bonusSkills.filter((skill) =>
    corpus.includes(normalize(skill)),
  );

  const requiredRatio =
    matchedRequiredSkills.length / Math.max(1, currentJob.requiredSkills.length);
  const bonusRatio = matchedBonusSkills.length / Math.max(1, currentJob.bonusSkills.length);

  const targetYears = detectTargetYears(currentJob.seniority);
  const candidateYears = detectYears(candidate.extractedText) ?? targetYears;
  const experienceScore = clamp(
    Math.round(58 + (candidateYears - targetYears) * 8 + requiredRatio * 18),
    35,
    98,
  );
  const communicationScore = clamp(
    Math.round(
      baseline.communicationScore * 0.7 +
        Math.min(candidate.emailBody.length / 8, 20) +
        (candidate.attachments.length > 1 ? 4 : 0),
    ),
    45,
    98,
  );
  const skillScore = clamp(
    Math.round(35 + requiredRatio * 45 + bonusRatio * 15 + matchedBonusSkills.length * 2),
    25,
    99,
  );

  const overallScore = clamp(
    Math.round(
      skillScore * 0.45 +
        experienceScore * 0.25 +
        communicationScore * 0.15 +
        baseline.overallScore * 0.15,
    ),
    20,
    99,
  );

  let decision: CandidateDecision = "refus";
  if (overallScore >= 80 && missingRequiredSkills.length <= 1) {
    decision = "acceptation shortlist";
  } else if (overallScore >= 68) {
    decision = "demande de complement";
  }

  if (
    decision !== "acceptation shortlist" &&
    baseline.decision === "acceptation shortlist" &&
    overallScore >= 60
  ) {
    decision = "acceptation shortlist";
  }

  const strengths = [
    ...matchedRequiredSkills.slice(0, 3).map((skill) => `Correspondance détectée sur ${skill}`),
    ...(matchedBonusSkills.length
      ? [`Bonus identifiés : ${matchedBonusSkills.slice(0, 2).join(", ")}`]
      : []),
  ];

  const gaps = [
    ...missingRequiredSkills.slice(0, 3).map((skill) => `Compétence peu visible : ${skill}`),
    ...(candidate.attachments.length < 2 ? ["Pièces de preuve limitées dans l'e-mail initial"] : []),
  ];

  const confidenceLabel =
    overallScore >= 85 && missingRequiredSkills.length <= 1
      ? "haute"
      : overallScore >= 68
        ? "à vérifier"
        : "moyenne";

  return {
    candidateId: candidate.id,
    overallScore,
    skillScore,
    experienceScore,
    communicationScore,
    decision,
    recommendation: buildRecommendation(decision, candidate.candidateName, currentJob.title),
    confidenceLabel,
    strengths: strengths.length ? strengths : baseline.strengths,
    gaps: gaps.length ? gaps : baseline.gaps,
    rationale: `Le score combine le recouvrement des compétences requises, la séniorité attendue (${currentJob.seniority}) et la qualité des preuves visibles dans l'e-mail initial.`,
    riskFlags:
      decision === "demande de complement"
        ? ["Une vérification humaine est nécessaire avant présélection."]
        : baseline.riskFlags,
  };
}
