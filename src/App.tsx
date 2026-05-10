import { useEffect, useMemo, useState } from "react";
import type { CandidateEvaluation, ExecutionMode, RunArtifact, RunRecord } from "./types";
import { useRecruiterDemo } from "./hooks/useRecruiterDemo";

const decisionTone: Record<CandidateEvaluation["decision"], string> = {
  "acceptation shortlist": "tone-positive",
  refus: "tone-negative",
  "demande de complement": "tone-warning",
};

type ViewMode = "screening" | "relay";
type ScreeningStage = "prepare" | "ranking";

const executionModeLabel: Record<ExecutionMode, string> = {
  deterministic: "Mode deterministe",
  live_llm: "Mode LLM en direct",
  compare: "Mode comparaison",
};

function formatDecision(decision: CandidateEvaluation["decision"]) {
  if (decision === "acceptation shortlist") {
    return "Préselection";
  }

  if (decision === "demande de complement") {
    return "À compléter";
  }

  return "Refus";
}

function formatSource(source: string) {
  if (source === "seed") {
    return "Scénario de démonstration";
  }

  return source.toUpperCase();
}

function formatWhen(value: string) {
  return new Date(value).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function lastRunLabel(lastRunAt: string | null) {
  return lastRunAt
    ? `Dernière analyse ${new Date(lastRunAt).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      })}`
    : "Aucune analyse";
}

function historySummary(run: RunRecord) {
  const shortlist = run.summaries.filter(
    (candidate) => candidate.decision === "acceptation shortlist",
  ).length;
  const complement = run.summaries.filter(
    (candidate) => candidate.decision === "demande de complement",
  ).length;

  return `${shortlist} en préselection, ${complement} à compléter`;
}

function historyMeta(run: RunRecord) {
  return `${executionModeLabel[run.mode]} via ${formatProvider(run.provider)}`;
}

function formatArtifactKind(kind: RunArtifact["kind"]) {
  switch (kind) {
    case "job_description":
      return "Poste";
    case "candidate_profile":
      return "Profil";
    case "match_matrix":
      return "Correspondance";
    case "decision":
      return "Décision";
    case "response_draft":
      return "Brouillon";
    case "run_summary":
      return "Synthèse";
    case "comparison":
      return "Comparaison";
    default:
      return kind;
  }
}

function formatProvider(provider: string) {
  if (provider === "local") {
    return "Moteur local";
  }

  if (provider === "openai") {
    return "OpenAI";
  }

  if (provider === "gemini") {
    return "Gemini";
  }

  return provider;
}

function formatAgentName(agentName: string) {
  switch (agentName) {
    case "Job Intake Agent":
      return "Agent d'analyse de fiche";
    case "Candidate Intake Agent":
      return "Agent d'ingestion candidat";
    case "Extraction Agent":
      return "Agent d'extraction";
    case "Match Agent":
      return "Agent de correspondance";
    case "Decision Agent":
      return "Agent de décision";
    case "Response Draft Agent":
      return "Agent de brouillon";
    case "Review Gate Agent":
      return "Agent de revue humaine";
    default:
      return agentName;
  }
}

function formatTraceStatus(status: string) {
  switch (status) {
    case "done":
      return "terminé";
    case "active":
      return "en cours";
    case "review":
      return "à relire";
    case "pending":
      return "en attente";
    default:
      return status;
  }
}

function renderList(items: unknown) {
  if (!Array.isArray(items) || !items.length) {
    return <p className="compare-empty">Aucun element.</p>;
  }

  return (
    <ul className="compare-list">
      {items.map((item) => (
        <li key={String(item)}>{String(item)}</li>
      ))}
    </ul>
  );
}

function renderArtifactBody(artifact: RunArtifact) {
  if (artifact.kind !== "comparison") {
    return <pre>{JSON.stringify(artifact.payload, null, 2)}</pre>;
  }

  const payload = artifact.payload as {
    candidateComparisons?: Array<{
      candidateId?: string;
      candidateName?: string;
      localDecision?: string;
      localDraftSubject?: string;
      localRank?: number;
      localScore?: number;
      providerDecision?: string | null;
      providerDraftSubject?: string | null;
      providerRank?: number | null;
      providerScore?: number | null;
      scoreDelta?: number | null;
    }>;
    effectiveProvider?: string;
    fallbackReason?: string | null;
    fallbackTriggered?: boolean;
    localJob?: {
      mustHave?: string[];
      requiredSkills?: string[];
      seniority?: string;
      title?: string;
    };
    providerJob?: {
      mustHave?: string[];
      requiredSkills?: string[];
      seniority?: string;
      title?: string;
    } | null;
    retainedRun?: string;
    requiredSkillsDelta?: {
      onlyLocal?: string[];
      onlyProvider?: string[];
    } | null;
  };

  return (
    <div className="compare-artifact">
      <div className="compare-columns">
        <section className="compare-card">
          <p className="section-kicker">Local</p>
          <strong>{payload.localJob?.title ?? "non disponible"}</strong>
          <p className="compare-meta">Seniorité : {payload.localJob?.seniority ?? "non disponible"}</p>
          <h4>Compétences requises</h4>
          {renderList(payload.localJob?.requiredSkills)}
          <h4>Indispensables</h4>
          {renderList(payload.localJob?.mustHave)}
        </section>

        <section className="compare-card">
          <p className="section-kicker">Provider</p>
          <strong>{payload.providerJob?.title ?? "Bascule locale"}</strong>
          <p className="compare-meta">Seniorité : {payload.providerJob?.seniority ?? "non disponible"}</p>
          <h4>Compétences requises</h4>
          {renderList(payload.providerJob?.requiredSkills)}
          <h4>Indispensables</h4>
          {renderList(payload.providerJob?.mustHave)}
        </section>
      </div>

      <section className="compare-delta-card">
        <div className="history-head">
          <div>
            <p className="section-kicker">Version retenue</p>
            <h4>{payload.retainedRun === "provider" ? "Pipeline provider" : "Pipeline local"}</h4>
          </div>
          <span className={payload.fallbackTriggered ? "subtle-pill tone-warning" : "subtle-pill"}>
            {payload.fallbackTriggered ? "Bascule locale" : "Comparaison en direct"}
          </span>
        </div>
        <div className="compare-delta-grid">
          <div>
            <p className="compare-delta-title">Seulement local</p>
            {renderList(payload.requiredSkillsDelta?.onlyLocal)}
          </div>
          <div>
            <p className="compare-delta-title">Seulement provider</p>
            {renderList(payload.requiredSkillsDelta?.onlyProvider)}
          </div>
        </div>
        {payload.fallbackReason ? <p className="run-warning-text">{payload.fallbackReason}</p> : null}
      </section>

      <section className="compare-delta-card">
        <div className="history-head">
          <div>
            <p className="section-kicker">Impact Candidat</p>
            <h4>Local vs provider</h4>
          </div>
          <span className="subtle-pill">
            Run actif : {formatProvider(payload.effectiveProvider ?? "local")}
          </span>
        </div>
        {!payload.candidateComparisons?.length ? (
          <p className="compare-empty">Aucun delta candidat disponible.</p>
        ) : (
          <div className="compare-candidate-stack">
            {payload.candidateComparisons.map((candidate) => {
              const hasProviderValues =
                typeof candidate.providerScore === "number" &&
                typeof candidate.providerRank === "number" &&
                Boolean(candidate.providerDecision);
              const scoreDelta = candidate.scoreDelta;
              const scoreDeltaLabel =
                typeof scoreDelta === "number"
                  ? `${scoreDelta > 0 ? "+" : ""}${scoreDelta}`
                  : "n/a";

              return (
                <article
                  key={candidate.candidateId ?? candidate.candidateName}
                  className="compare-candidate-card"
                >
                  <div className="compare-candidate-head">
                    <div>
                      <strong>{candidate.candidateName ?? "Candidat"}</strong>
                      <p className="compare-meta">Delta score : {scoreDeltaLabel}</p>
                    </div>
                    <span className="subtle-pill">
                      Rang {candidate.localRank ?? "-"} → {candidate.providerRank ?? "-"}
                    </span>
                  </div>

                  <div className="compare-candidate-grid">
                    <div>
                      <p className="section-kicker">Local</p>
                      <p className="compare-candidate-metric">
                        Score {candidate.localScore ?? "-"} •{" "}
                        {candidate.localDecision ? formatDecision(candidate.localDecision as CandidateEvaluation["decision"]) : "n/a"}
                      </p>
                      <p className="compare-candidate-subject">
                        {candidate.localDraftSubject ?? "Brouillon local indisponible"}
                      </p>
                    </div>

                    <div>
                      <p className="section-kicker">Provider</p>
                      {hasProviderValues ? (
                        <>
                          <p className="compare-candidate-metric">
                            Score {candidate.providerScore ?? "-"} •{" "}
                            {candidate.providerDecision
                              ? formatDecision(candidate.providerDecision as CandidateEvaluation["decision"])
                              : "n/a"}
                          </p>
                          <p className="compare-candidate-subject">
                            {candidate.providerDraftSubject ?? "Brouillon provider indisponible"}
                          </p>
                        </>
                      ) : (
                        <p className="compare-empty">Provider indisponible, run local conservé.</p>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function App() {
  const {
    activeProvider,
    allReplayTraces,
    artifacts,
    candidateViews,
    completedTraceCount,
    currentActiveTrace,
    currentJob,
    executionMode,
    fallbackReason,
    fallbackTriggered,
    hasCompletedRun,
    isPreparingRun,
    isRunning,
    jobDescriptionText,
    lastRunAt,
    playedCandidateId,
    progressPercent,
    providerApiKey,
    providerConfigs,
    runBlueprint,
    runCount,
    runHistory,
    runtimeCandidateCount,
    selectedCandidate,
    selectedDraft,
    selectedId,
    setActiveProvider,
    setExecutionMode,
    setProviderApiKey,
    selectCandidate,
    runReplay,
  } = useRecruiterDemo();
  const [viewMode, setViewMode] = useState<ViewMode>("screening");
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(null);
  const [screeningStage, setScreeningStage] = useState<ScreeningStage>("prepare");
  const [detailCandidateId, setDetailCandidateId] = useState<string | null>(null);
  const [showProviderModal, setShowProviderModal] = useState(false);

  const shortlistCount = candidateViews.filter(
    (candidate) => candidate.evaluation.decision === "acceptation shortlist",
  ).length;
  const complementCount = candidateViews.filter(
    (candidate) => candidate.evaluation.decision === "demande de complement",
  ).length;
  const rejectCount = candidateViews.filter(
    (candidate) => candidate.evaluation.decision === "refus",
  ).length;

  const bestCandidate = candidateViews[0] ?? null;
  const nextAction =
    hasCompletedRun || isRunning
      ? bestCandidate
        ? `${bestCandidate.candidateName} mène le classement avec ${bestCandidate.evaluation.overallScore}/100.`
        : "Aucun candidat chargé."
      : `${runtimeCandidateCount} candidatures seeds consultables avant exécution.`;

  const visibleArtifacts = hasCompletedRun || isRunning ? artifacts : [];
  const activeArtifact = useMemo(() => {
    if (!visibleArtifacts.length) {
      return null;
    }

    return visibleArtifacts.find((artifact) => artifact.id === selectedArtifactId) ?? visibleArtifacts[0];
  }, [selectedArtifactId, visibleArtifacts]);

  const parsedSignals = [
    { label: "Rôle détecté", value: currentJob.title },
    { label: "Seniorité", value: currentJob.seniority },
    { label: "Localisation", value: currentJob.location },
    { label: "Langue", value: currentJob.language },
  ];
  const comparisonArtifact = artifacts.find((artifact) => artifact.kind === "comparison") ?? null;
  const comparisonPayload = comparisonArtifact?.payload as
    | {
        requiredSkillsDelta?: {
          onlyLocal?: string[];
          onlyProvider?: string[];
        } | null;
      }
    | undefined;

  useEffect(() => {
    if (isRunning || isPreparingRun || !hasCompletedRun) {
      setScreeningStage("prepare");
    } else {
      setScreeningStage("ranking");
    }
  }, [hasCompletedRun, isPreparingRun, isRunning]);

  useEffect(() => {
    if (!hasCompletedRun) {
      setDetailCandidateId(null);
    }
  }, [hasCompletedRun]);

  useEffect(() => {
    if (executionMode !== "deterministic") {
      setShowProviderModal(true);
    } else {
      setShowProviderModal(false);
    }
  }, [executionMode]);

  const showPrepareStage = screeningStage === "prepare";
  const showRankingStage = hasCompletedRun && screeningStage === "ranking";
  const showDetailStage = showRankingStage && detailCandidateId === selectedId && selectedCandidate !== null;
  const needsProviderKey = executionMode !== "deterministic";
  const activeProviderLabel = formatProvider(activeProvider.provider);
  const headerClass =
    viewMode === "relay"
      ? "app-header app-header-relay"
      : showDetailStage
        ? "app-header app-header-results"
        : "app-header app-header-compact";

  const executionSummary =
    executionMode === "deterministic"
      ? "Lecture locale uniquement. Les notes restent stables sur le dataset seed."
      : executionMode === "live_llm"
        ? "Le provider relit la fiche et les agents candidat. Les scores, décisions et brouillons peuvent varier."
        : "Le compare mode confronte un run local et un run provider sur le même scénario seed.";

  function openCandidateDetail(candidateId: string) {
    selectCandidate(candidateId);
    setDetailCandidateId(candidateId);
  }

  return (
    <div className="app-shell">
      <header className={headerClass}>
        <div className="header-brand">
          <span className="brand-eyebrow">Agent Assistant Recrutement</span>
          <div className="brand-row">
            <div>
              <h1>Agent Assistant Recrutement</h1>
              <p className="header-description">
                Le système rejoue un scénario seed complet et expose les différences entre mode
                déterministe et chemin provider sur un même lot candidat et une même fiche de poste.
              </p>
            </div>

            <div className="header-run-card">
              <span className="section-kicker">Analyse en cours</span>
              <strong>{lastRunLabel(lastRunAt)}</strong>
              <p>{nextAction}</p>
            </div>
          </div>
        </div>

        <nav className="header-nav" aria-label="Vues">
          <button
            type="button"
            className={viewMode === "screening" ? "nav-tab nav-tab-active" : "nav-tab"}
            onClick={() => setViewMode("screening")}
          >
            Analyse
          </button>
          <button
            type="button"
            className={viewMode === "relay" ? "nav-tab nav-tab-active" : "nav-tab"}
            onClick={() => setViewMode("relay")}
          >
            Relais d'agents
          </button>
        </nav>
      </header>

      {viewMode === "screening" ? (
        <>
          <div className={showDetailStage ? "screening-stage-nav screening-stage-nav-results" : "screening-stage-nav screening-stage-nav-compact"}>
            <button
              type="button"
              className={showPrepareStage ? "stage-tab stage-tab-active" : "stage-tab"}
              onClick={() => setScreeningStage("prepare")}
            >
              Étape 1 · Préparer le poste
            </button>
            <button
              type="button"
              className={showRankingStage ? "stage-tab stage-tab-active" : "stage-tab"}
              onClick={() => setScreeningStage("ranking")}
              disabled={!hasCompletedRun}
            >
              Étape 2 · Voir le classement
            </button>
          </div>

          <main className={showPrepareStage ? "single-view" : showDetailStage ? "results-grid results-grid-centered" : "single-view single-view-centered"}>
            {showPrepareStage ? (
              <section className="panel input-panel input-panel-centered">
                <div className="panel-top">
                  <div>
                    <p className="section-kicker">Étape 1</p>
                    <h2>Scénario seed de référence</h2>
                  </div>
                  <span className="subtle-pill">Fiche et candidats en lecture seule</span>
                </div>

                <p className="panel-intro">
                  Le testeur ne modifie ni la fiche ni les candidats. Il consulte le scénario seed,
                  puis il choisit un mode d'exécution et peut ajouter sa clé API pour rejouer le pipeline.
                </p>

                <div className="mode-switcher" role="tablist" aria-label="Mode d'exécution">
                  {(["deterministic", "live_llm", "compare"] as ExecutionMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      className={executionMode === mode ? "mode-chip mode-chip-active" : "mode-chip"}
                      onClick={() => setExecutionMode(mode)}
                    >
                      {executionModeLabel[mode]}
                    </button>
                  ))}
                </div>

                {needsProviderKey ? (
                  <div className="llm-inline-controls">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => setShowProviderModal(true)}
                    >
                      {providerApiKey
                        ? `Clé API configurée pour ${activeProviderLabel}`
                        : `Configurer la clé API pour ${activeProviderLabel}`}
                    </button>
                  </div>
                ) : null}

                <div className="mode-summary-card">
                  <article>
                    <span className="mini-label">Jeu de données</span>
                    <strong>{runtimeCandidateCount} candidats seed</strong>
                    <p>Le scénario reste identique à chaque exécution pour rendre les comparaisons défendables.</p>
                  </article>
                  <article>
                    <span className="mini-label">Mode actif</span>
                    <strong>{executionModeLabel[executionMode]}</strong>
                    <p>{executionSummary}</p>
                  </article>
                </div>

                <div className="prepare-composer prepare-composer-compact">
                  <div className="composer-pane">
                    <section className="seed-job-card">
                      <div className="history-head">
                        <div>
                          <p className="section-kicker">Fiche seed</p>
                          <h3>{currentJob.title}</h3>
                        </div>
                        <span className="subtle-pill">{currentJob.seniority}</span>
                      </div>
                      <pre className="seed-job-pre">{jobDescriptionText}</pre>
                    </section>
                  </div>

                  <section className="criteria-block criteria-block-card">
                    <div className="criteria-head">
                      <p className="section-kicker">Ce que les agents lisent</p>
                      <span className="subtle-pill">{currentJob.requiredSkills.length} requis</span>
                    </div>
                    <div className="chip-row">
                      {currentJob.requiredSkills.map((item) => (
                        <span key={item} className="chip">
                          {item}
                        </span>
                      ))}
                    </div>
                    <ul className="criteria-list">
                      {currentJob.mustHave.slice(0, 3).map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </section>
                </div>

                <section className="seed-candidates-card">
                  <div className="history-head">
                    <div>
                      <p className="section-kicker">Candidatures consultables</p>
                      <h3>Lot seed actuel</h3>
                    </div>
                    <span className="subtle-pill">{candidateViews.length} profils</span>
                  </div>
                  <p className="panel-intro">
                    Ces candidats fictifs sont rejoués à l'identique. En mode LLM, les agents
                    provider peuvent faire varier score, décision et brouillon. En mode
                    déterministe, les notes restent stables.
                  </p>
                  <div className="seed-candidates-grid">
                    {candidateViews.map((candidate) => (
                      <article key={candidate.id} className="seed-candidate-card">
                        <div className="seed-candidate-top">
                          <strong>{candidate.candidateName}</strong>
                          <span className="candidate-meta-pill">{candidate.evaluation.confidenceLabel}</span>
                        </div>
                        <p>{candidate.emailSubject}</p>
                        <small>{formatSource(candidate.source)} - {candidate.attachments.length} pièce(s)</small>
                        <div className="chip-row">
                          {candidate.attachments.map((attachment) => (
                            <span key={attachment} className="chip chip-muted">
                              {attachment}
                            </span>
                          ))}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>

                <button
                  type="button"
                  className="primary-button"
                  onClick={runReplay}
                  disabled={isRunning || isPreparingRun}
                >
                  {isPreparingRun
                    ? "Préparation de l'analyse..."
                    : isRunning
                      ? "Analyse du lot en cours..."
                      : "Lancer l'analyse"}
                </button>

                <section className="run-status-card">
                  <div className="run-status-head">
                    <div>
                      <p className="section-kicker">Exécution</p>
                      <h3>{isRunning ? "Analyse en cours" : "Pipeline prêt"}</h3>
                    </div>
                    <span className="subtle-pill">
                      {hasCompletedRun || isRunning
                        ? `${completedTraceCount}/${allReplayTraces.length} étapes`
                        : "Aucune étape exécutée"}
                    </span>
                  </div>
                  <div className="progress-track" aria-hidden="true">
                    <div className="progress-bar" style={{ width: `${progressPercent}%` }} />
                  </div>
                  <p className="run-status-text">
                    {currentActiveTrace
                      ? `${formatAgentName(currentActiveTrace.agentName)} traite ${candidateViews.find((candidate) => candidate.id === currentActiveTrace.candidateId)?.candidateName ?? "le lot"}.`
                      : isPreparingRun
                        ? "Le système prépare les artefacts du run et tente l'extraction en direct si le mode le demande."
                        : "Aucun agent en cours. Lance une analyse pour rejouer le pipeline complet."}
                  </p>
                  {fallbackTriggered ? <p className="run-warning-text">{fallbackReason}</p> : null}
                </section>

                {(hasCompletedRun || isRunning) ? (
                  <div className="signal-grid">
                    {parsedSignals.map((signal) => (
                      <article key={signal.label} className="signal-card">
                        <span>{signal.label}</span>
                        <strong>{signal.value}</strong>
                      </article>
                    ))}
                  </div>
                ) : null}

                <section className="governance-card">
                  <div className="history-head">
                    <div>
                      <p className="section-kicker">Gouvernance</p>
                      <h3>Cadre d'exécution</h3>
                    </div>
                    <span className="subtle-pill">{executionModeLabel[executionMode]}</span>
                  </div>
                  <ul className="governance-list">
                    <li>Le scénario complet reste seed et consultable, sans saisie externe dans cette version.</li>
                    <li>En mode LLM, la lecture provider et les agents candidat peuvent faire varier les sorties du run.</li>
                    <li>Revue humaine obligatoire avant toute action externe.</li>
                    <li>Aucun envoi d'email automatique dans cette V1.</li>
                    <li>
                      Fournisseur effectif : {formatProvider(runBlueprint.provider)}. Fournisseur demandé :{" "}
                      {executionMode === "deterministic" ? "Moteur local" : formatProvider(activeProvider.provider)}.
                    </li>
                  </ul>
                </section>
              </section>
            ) : null}

            {showRankingStage ? (
              <section className={showDetailStage ? "panel ranking-panel" : "panel ranking-panel ranking-panel-centered"}>
                <div className="panel-top">
                  <div>
                    <p className="section-kicker">Étape 2</p>
                    <h2>Classement des candidatures</h2>
                  </div>
                  <span className="subtle-pill">
                    Analyse {runCount} - {lastRunAt ? formatWhen(lastRunAt) : "jamais lancée"}
                  </span>
                </div>

                <div className="dashboard-stats">
                  <article>
                    <span>Lot</span>
                    <strong>{candidateViews.length}</strong>
                  </article>
                  <article>
                    <span>Préselection</span>
                    <strong>{shortlistCount}</strong>
                  </article>
                  <article>
                    <span>À compléter</span>
                    <strong>{complementCount}</strong>
                  </article>
                  <article>
                    <span>Refus</span>
                    <strong>{rejectCount}</strong>
                  </article>
                </div>

                <div className="ranking-table-head">
                  <span>Rang</span>
                  <span>Candidat</span>
                  <span>Décision</span>
                  <span className="text-right">Score</span>
                </div>

                <div className="ranking-list">
                  {candidateViews.map((candidate, index) => (
                    <button
                      key={candidate.id}
                      type="button"
                      className={selectedId === candidate.id ? "candidate-row candidate-row-active" : "candidate-row"}
                      onClick={() => openCandidateDetail(candidate.id)}
                    >
                      <span className="candidate-rank">#{index + 1}</span>
                      <div className="candidate-main">
                        <div className="candidate-name-row">
                          <strong>{candidate.candidateName}</strong>
                          <span className="candidate-meta-pill">{candidate.evaluation.confidenceLabel}</span>
                        </div>
                        <p>{candidate.evaluation.recommendation}</p>
                        <small>
                          {formatSource(candidate.source)} - {formatWhen(candidate.receivedAt)} -{" "}
                          {candidate.attachments.length} pièce(s)
                        </small>
                      </div>
                      <span className={`decision-pill ${decisionTone[candidate.evaluation.decision]}`}>
                        {formatDecision(candidate.evaluation.decision)}
                      </span>
                      <strong className="candidate-score text-right">{candidate.evaluation.overallScore}</strong>
                    </button>
                  ))}
                </div>

                <div className="history-block">
                  <div className="history-head">
                    <div>
                      <p className="section-kicker">Historique</p>
                      <h3>Analyses précédentes</h3>
                    </div>
                    <span className="subtle-pill">{runHistory.length} enregistrées</span>
                  </div>

                  <div className="history-list">
                    {runHistory.length ? (
                      runHistory.map((run) => (
                        <article key={run.id} className="history-item">
                          <div>
                            <strong>{formatWhen(run.ranAt)}</strong>
                            <p>Meilleur candidat : {run.topCandidateName} ({run.topScore}/100)</p>
                          </div>
                          <span>{historySummary(run)} - {historyMeta(run)}</span>
                        </article>
                      ))
                    ) : (
                      <p className="history-empty">Aucune analyse persistée pour le moment.</p>
                    )}
                  </div>
                </div>
              </section>
            ) : null}

            {showDetailStage && selectedCandidate && selectedDraft ? (
              <aside className="panel detail-panel">
                <div className="panel-top">
                  <div>
                    <p className="section-kicker">Étape 3</p>
                    <h2>{selectedCandidate.candidateName}</h2>
                  </div>
                  <span className={`subtle-pill ${decisionTone[selectedCandidate.evaluation.decision]}`}>
                    {formatDecision(selectedCandidate.evaluation.decision)}
                  </span>
                </div>

                <div className="candidate-identity-card">
                  <div>
                    <span className="mini-label">Email</span>
                    <strong>{selectedCandidate.sender}</strong>
                  </div>
                  <div>
                    <span className="mini-label">Objet</span>
                    <strong>{selectedCandidate.emailSubject}</strong>
                  </div>
                  <div>
                    <span className="mini-label">Reçu</span>
                    <strong>{formatWhen(selectedCandidate.receivedAt)}</strong>
                  </div>
                </div>

                <div className="detail-score-section">
                  <div className="score-global-block">
                    <span>Score global</span>
                    <strong>{selectedCandidate.evaluation.overallScore}</strong>
                    <small>{selectedCandidate.evaluation.confidenceLabel}</small>
                  </div>

                  <div className="score-breakdown-list">
                    <article>
                      <span>Compétences</span>
                      <strong>{selectedCandidate.evaluation.skillScore}</strong>
                    </article>
                    <article>
                      <span>Expérience</span>
                      <strong>{selectedCandidate.evaluation.experienceScore}</strong>
                    </article>
                    <article>
                      <span>Communication</span>
                      <strong>{selectedCandidate.evaluation.communicationScore}</strong>
                    </article>
                  </div>
                </div>

                <p className="detail-summary">{selectedCandidate.evaluation.recommendation}</p>

                <section className="detail-rationale">
                  <p className="section-kicker">Pourquoi cette décision</p>
                  <p>{selectedCandidate.evaluation.rationale}</p>
                </section>

                <div className="detail-split">
                  <section className="detail-card">
                    <h3>Signaux forts</h3>
                    <ul>
                      {selectedCandidate.evaluation.strengths.map((strength) => (
                        <li key={strength}>{strength}</li>
                      ))}
                    </ul>
                  </section>
                  <section className="detail-card">
                    <h3>Points à vérifier</h3>
                    <ul>
                      {selectedCandidate.evaluation.gaps.map((gap) => (
                        <li key={gap}>{gap}</li>
                      ))}
                      {selectedCandidate.evaluation.riskFlags.map((flag) => (
                        <li key={flag}>{flag}</li>
                      ))}
                    </ul>
                  </section>
                </div>

                <section className="candidate-evidence-card">
                  <div className="candidate-evidence-head">
                    <p className="section-kicker">Preuves lues</p>
                    <span className="subtle-pill">{selectedCandidate.attachments.length} pièces</span>
                  </div>
                  <p className="evidence-body">{selectedCandidate.emailBody}</p>
                  <div className="chip-row">
                    {selectedCandidate.attachments.map((attachment) => (
                      <span key={attachment} className="chip chip-muted">
                        {attachment}
                      </span>
                    ))}
                  </div>
                </section>

                <section className="draft-panel">
                  <div className="draft-head">
                    <div>
                      <p className="draft-kicker">Brouillon de réponse</p>
                      <h3>{selectedDraft.subject}</h3>
                    </div>
                    <span className="subtle-pill">{playedCandidateId === "all" ? "brouillon" : "prêt à relire"}</span>
                  </div>
                  <pre>{selectedDraft.body}</pre>
                </section>
              </aside>
            ) : null}
          </main>
        </>
      ) : null}

      {viewMode === "relay" ? (
        <main className="single-view single-view-centered">
          <section className="panel relay-page relay-page-centered">
            <div className="panel-top">
              <div>
                <p className="section-kicker">Pipeline visible</p>
                <h2>Relais multi-agents du lot</h2>
              </div>
              <div className="relay-toolbar">
                <div className="relay-toolbar-meta">
                  <span className="subtle-pill">{playedCandidateId === "all" ? "lot rejoué" : "prêt à lancer"}</span>
                  <span className="subtle-pill">{executionModeLabel[executionMode]} - {formatProvider(activeProvider.provider)}</span>
                </div>
                <button
                  type="button"
                  className="primary-button primary-button-inline"
                  onClick={runReplay}
                  disabled={isRunning || isPreparingRun}
                >
                  {isPreparingRun ? "Préparation..." : isRunning ? "Analyse..." : "Rejouer le lot"}
                </button>
              </div>
            </div>

            {hasCompletedRun || isRunning ? (
              <div className="relay-layout">
                <div className="relay-stack">
                  {allReplayTraces.map((trace) => (
                    <article key={trace.id} className="relay-step">
                      <div className="relay-step-top">
                        <strong>
                          {formatAgentName(trace.agentName)} -{" "}
                          {candidateViews.find((candidate) => candidate.id === trace.candidateId)?.candidateName ?? "lot"}
                        </strong>
                        <span className={`status-pill status-${trace.replayStatus.toLowerCase()}`}>
                          {formatTraceStatus(trace.replayStatus)}
                        </span>
                      </div>
                      <p>{trace.inputSummary}</p>
                      <small>{trace.outputSummary}</small>
                      <footer>
                        <span>{trace.artifactLabel} - vers {formatAgentName(trace.handoffTo)}</span>
                        <span>
                          {formatProvider(trace.provider)} - {trace.durationMs} ms
                          {trace.fallbackUsed ? " - bascule locale" : ""}
                        </span>
                      </footer>
                    </article>
                  ))}
                </div>

                <aside className="artifact-panel">
                  <div className="history-head">
                    <div>
                      <p className="section-kicker">Inspecteur d'artefacts</p>
                      <h3>Sorties du système</h3>
                    </div>
                    <span className="subtle-pill">{visibleArtifacts.length} artefacts</span>
                  </div>

                  <div className="artifact-list">
                    {visibleArtifacts.map((artifact) => (
                      <button
                        key={artifact.id}
                        type="button"
                        className={activeArtifact?.id === artifact.id ? "artifact-row artifact-row-active" : "artifact-row"}
                        onClick={() => setSelectedArtifactId(artifact.id)}
                      >
                        <span className="artifact-kind-pill">{formatArtifactKind(artifact.kind)}</span>
                        <div className="artifact-row-main">
                          <strong>{artifact.title}</strong>
                          <small>{artifact.summary}</small>
                        </div>
                      </button>
                    ))}
                  </div>

                  {activeArtifact ? (
                    <section className="artifact-preview">
                      <div className="artifact-preview-head">
                        <div>
                          <p className="section-kicker">Artefact actif</p>
                          <h3>{activeArtifact.title}</h3>
                        </div>
                        <span className="subtle-pill">{formatArtifactKind(activeArtifact.kind)}</span>
                      </div>
                      <p className="artifact-summary">{activeArtifact.summary}</p>
                      {renderArtifactBody(activeArtifact)}
                    </section>
                  ) : null}
                </aside>
              </div>
            ) : (
              <section className="empty-state-card">
                <p className="section-kicker">Avant analyse</p>
                <h3>Le relais reste vide jusqu'à la première analyse</h3>
                <p>C'est volontaire : la démo ne doit pas montrer de faux résultat avant le run.</p>
              </section>
            )}

            {executionMode === "compare" && comparisonArtifact && comparisonPayload ? (
              <section className="job-intake-card">
                <div className="history-head">
                  <div>
                    <p className="section-kicker">Mode compare</p>
                    <h3>Ce qui est réellement comparé</h3>
                  </div>
                  <span className="subtle-pill">Deux runs sur le même seed</span>
                </div>
                <p className="panel-intro">
                  Le système exécute un pipeline local et un pipeline provider sur le même scénario,
                  puis expose les écarts sur la fiche, les scores, les décisions, les rangs et les
                  brouillons candidats.
                </p>
                <div className="compare-delta-grid">
                  <div>
                    <p className="compare-delta-title">Seulement local</p>
                    {renderList(comparisonPayload.requiredSkillsDelta?.onlyLocal)}
                  </div>
                  <div>
                    <p className="compare-delta-title">Seulement provider</p>
                    {renderList(comparisonPayload.requiredSkillsDelta?.onlyProvider)}
                  </div>
                </div>
              </section>
            ) : null}
          </section>
        </main>
      ) : null}

      {showProviderModal && needsProviderKey ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setShowProviderModal(false)}>
          <section
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="provider-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <p className="section-kicker">Clé API de test</p>
                <h2 id="provider-modal-title">
                  {executionMode === "live_llm"
                    ? "Configurer l'extraction en direct"
                    : "Configurer la comparaison fournisseur"}
                </h2>
              </div>
              <button
                type="button"
                className="modal-close-button"
                onClick={() => setShowProviderModal(false)}
                aria-label="Fermer la fenêtre"
              >
                Fermer
              </button>
            </div>

            <p className="panel-intro">
              Cette zone permet à un testeur d'utiliser sa propre clé API pour rejouer le pipeline
              sur le lot seed actuel.
            </p>

            <div className="provider-tabs">
              {providerConfigs.map((provider) => (
                <button
                  key={provider.provider}
                  type="button"
                  className={activeProvider.provider === provider.provider ? "provider-tab provider-tab-active" : "provider-tab"}
                  onClick={() => setActiveProvider(provider)}
                >
                  {formatProvider(provider.provider)}
                </button>
              ))}
            </div>

            <label className="input-group">
              Clé API personnelle
              <input
                type="password"
                placeholder={activeProvider.apiKeyLabel}
                value={providerApiKey}
                onChange={(event) => setProviderApiKey(activeProvider.provider, event.target.value)}
              />
            </label>
          </section>
        </div>
      ) : null}
    </div>
  );
}

export default App;
