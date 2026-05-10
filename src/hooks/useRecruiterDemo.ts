import { useEffect, useMemo, useState } from "react";
import { candidates as seededCandidates, jobDescriptionRaw, providerConfigs } from "../data/demo";
import {
  buildRunRecordFromBlueprint,
  buildScreeningRunBlueprint,
  executeScreeningRun,
} from "../lib/runEngine";
import type {
  AgentExecutionStep,
  AgentStatus,
  CandidateEvaluation,
  CandidateSubmission,
  ExecutionMode,
  PlaygroundProviderConfig,
  ResponseDraft,
  RunRecord,
  ScreeningRunBlueprint,
} from "../types";

export type ReplayStatus = AgentStatus | "pending" | "active";

export interface CandidateView extends CandidateSubmission {
  evaluation: CandidateEvaluation;
  draft: ResponseDraft;
}

export interface ReplayTrace extends AgentExecutionStep {
  replayStatus: ReplayStatus;
}

const STORAGE_KEY = "ia-recruter-demo-state";

function replayTraceStatus(
  trace: AgentExecutionStep,
  selectedId: string,
  playedCandidateId: string | null,
  isRunning: boolean,
  activeTraceIndex: number,
  traceIndex: number,
): ReplayTrace {
  if (!isRunning) {
    if (playedCandidateId === "all") {
      return { ...trace, replayStatus: trace.status };
    }

    return {
      ...trace,
      replayStatus: trace.candidateId === selectedId ? "pending" : trace.status,
    };
  }

  if (traceIndex < activeTraceIndex) {
    return { ...trace, replayStatus: trace.status };
  }

  if (traceIndex === activeTraceIndex) {
    return { ...trace, replayStatus: "active" };
  }

  return { ...trace, replayStatus: "pending" };
}

export function useRecruiterDemo() {
  const [selectedId, setSelectedId] = useState("cand-ada");
  const [activeProvider, setActiveProvider] = useState<PlaygroundProviderConfig>(
    providerConfigs[0],
  );
  const [executionMode, setExecutionMode] = useState<ExecutionMode>("deterministic");
  const [providerApiKeys, setProviderApiKeys] = useState<Record<string, string>>({
    openai: "",
    gemini: "",
  });
  const [playedCandidateId, setPlayedCandidateId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPreparingRun, setIsPreparingRun] = useState(false);
  const [activeTraceIndex, setActiveTraceIndex] = useState(0);
  const [runCount, setRunCount] = useState(0);
  const [lastRunAt, setLastRunAt] = useState<string | null>(null);
  const [runHistory, setRunHistory] = useState<RunRecord[]>([]);
  const [executedBlueprint, setExecutedBlueprint] = useState<ScreeningRunBlueprint | null>(null);

  const previewBlueprint = useMemo<ScreeningRunBlueprint>(
    () =>
      buildScreeningRunBlueprint(
        jobDescriptionRaw,
        "deterministic",
        "local",
        undefined,
        seededCandidates,
      ),
    [],
  );

  const activeBlueprint = executedBlueprint ?? previewBlueprint;

  const candidateViews = useMemo<CandidateView[]>(
    () =>
      activeBlueprint.candidateResults.map((result) => ({
        ...result.candidate,
        evaluation: result.evaluation,
        draft: result.draft,
      })),
    [activeBlueprint],
  );

  const stepList = activeBlueprint.steps;

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw) as {
        executionMode?: ExecutionMode;
        lastRunAt?: string | null;
        providerApiKeys?: Record<string, string>;
        runCount?: number;
        runHistory?: RunRecord[];
        selectedId?: string;
      };

      if (parsed.selectedId) {
        setSelectedId(parsed.selectedId);
      }
      if (typeof parsed.runCount === "number") {
        setRunCount(parsed.runCount);
      }
      if (parsed.lastRunAt !== undefined) {
        setLastRunAt(parsed.lastRunAt);
      }
      if (Array.isArray(parsed.runHistory)) {
        setRunHistory(parsed.runHistory);
      }
      if (parsed.executionMode) {
        setExecutionMode(parsed.executionMode);
      }
      if (parsed.providerApiKeys) {
        setProviderApiKeys((current) => ({ ...current, ...parsed.providerApiKeys }));
      }
    } catch {
      // Ignore malformed browser storage and keep defaults.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          executionMode,
          lastRunAt,
          providerApiKeys,
          runCount,
          runHistory,
          selectedId,
        }),
      );
    } catch {
      // Ignore browser storage failures.
    }
  }, [executionMode, lastRunAt, providerApiKeys, runCount, runHistory, selectedId]);

  useEffect(() => {
    setExecutedBlueprint(null);
    setPlayedCandidateId(null);
    setIsRunning(false);
    setActiveTraceIndex(0);
  }, [activeProvider.provider, executionMode, providerApiKeys]);

  useEffect(() => {
    if (!candidateViews.some((candidate) => candidate.id === selectedId)) {
      setSelectedId(candidateViews[0]?.id ?? "");
    }
  }, [candidateViews, selectedId]);

  const selectedCandidate = candidateViews.find((candidate) => candidate.id === selectedId) ?? null;
  const selectedDraft = selectedCandidate?.draft ?? null;
  const currentActiveTrace = isRunning ? stepList[activeTraceIndex] ?? null : null;
  const completedTraceCount = Math.min(activeTraceIndex, stepList.length);
  const progressPercent = stepList.length
    ? Math.round((completedTraceCount / stepList.length) * 100)
    : 0;
  const hasCompletedRun = executedBlueprint !== null;

  const selectedTrace = useMemo(
    () =>
      stepList
        .filter((trace) => trace.candidateId === selectedId)
        .map((trace) =>
          replayTraceStatus(
            trace,
            selectedId,
            playedCandidateId,
            isRunning,
            activeTraceIndex,
            stepList.findIndex((step) => step.id === trace.id),
          ),
        ),
    [activeTraceIndex, isRunning, playedCandidateId, selectedId, stepList],
  );

  const allReplayTraces = useMemo(
    () =>
      stepList.map((trace, index) =>
        replayTraceStatus(
          trace,
          selectedId,
          playedCandidateId,
          isRunning,
          activeTraceIndex,
          index,
        ),
      ),
    [activeTraceIndex, isRunning, playedCandidateId, selectedId, stepList],
  );

  useEffect(() => {
    if (!isRunning) {
      return undefined;
    }

    const traceCount = stepList.length;
    const timeout = window.setTimeout(() => {
      setActiveTraceIndex((currentIndex) => {
        if (currentIndex >= traceCount - 1) {
          const ranAt = new Date().toISOString();
          const nextRecord = buildRunRecordFromBlueprint(activeBlueprint, ranAt);

          setIsRunning(false);
          setRunCount((count) => count + 1);
          setLastRunAt(ranAt);
          setRunHistory((history) => [nextRecord, ...history].slice(0, 8));
          return traceCount;
        }

        return currentIndex + 1;
      });
    }, 650);

    return () => window.clearTimeout(timeout);
  }, [activeBlueprint, activeTraceIndex, isRunning, stepList]);

  function selectCandidate(candidateId: string) {
    setSelectedId(candidateId);
    setIsRunning(false);
    setActiveTraceIndex(0);
  }

  async function runReplay() {
    const requestedProvider =
      executionMode === "deterministic" ? "local" : activeProvider.provider;

    setPlayedCandidateId("all");
    setActiveTraceIndex(0);
    setIsPreparingRun(true);

    try {
      const blueprint =
        executionMode === "deterministic"
          ? buildScreeningRunBlueprint(
              jobDescriptionRaw,
              executionMode,
              requestedProvider,
              undefined,
              seededCandidates,
            )
          : await executeScreeningRun(
              jobDescriptionRaw,
              executionMode,
              requestedProvider,
              providerApiKeys[activeProvider.provider],
              seededCandidates,
            );

      setExecutedBlueprint(blueprint);
      setIsRunning(true);
    } finally {
      setIsPreparingRun(false);
    }
  }

  function setProviderApiKey(provider: string, value: string) {
    setProviderApiKeys((current) => ({
      ...current,
      [provider]: value,
    }));
  }

  return {
    activeProvider,
    allReplayTraces,
    artifacts: activeBlueprint.artifacts,
    candidateViews,
    completedTraceCount,
    currentActiveTrace,
    currentJob: activeBlueprint.job,
    executionMode,
    fallbackReason: activeBlueprint.fallbackReason,
    fallbackTriggered: activeBlueprint.fallbackTriggered,
    hasCompletedRun,
    isPreparingRun,
    isRunning,
    jobDescriptionText: jobDescriptionRaw,
    lastRunAt,
    playedCandidateId,
    progressPercent,
    providerApiKey: providerApiKeys[activeProvider.provider] ?? "",
    providerConfigs,
    runBlueprint: activeBlueprint,
    runCount,
    runHistory,
    runtimeCandidateCount: seededCandidates.length,
    selectedCandidate,
    selectedDraft,
    selectedId,
    selectedTrace,
    setActiveProvider,
    setExecutionMode,
    setProviderApiKey,
    selectCandidate,
    runReplay,
  };
}
