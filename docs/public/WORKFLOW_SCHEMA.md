# Workflow Schema

```mermaid
flowchart LR
    A[Fiche de poste brute] --> B[Job Intake Agent]
    B --> C{Mode}
    C -->|deterministic| D[Parse local]
    C -->|live_llm| E[Provider OpenAI ou Gemini]
    C -->|compare| F[Local vs Provider]
    E --> G[Fallback local si erreur]
    F --> G
    D --> H[JobDescriptionArtifact]
    E --> H
    G --> H

    I[Emails candidats seed] --> J[Candidate Intake Agent]
    J --> K[Extraction Agent]
    K --> L[CandidateProfileArtifact]
    L --> M[Match Agent]
    M --> N[MatchMatrixArtifact]
    N --> O[Decision Agent]
    O --> P[DecisionArtifact]
    P --> Q[Response Draft Agent]
    Q --> R[ResponseDraftArtifact]
    R --> S[Review Gate Agent]
    S --> T[RunSummaryArtifact]

    H --> M
    T --> U[Dashboard candidat]
    T --> V[Historique de runs]
    H --> W[Artifact Inspector]
    L --> W
    N --> W
    P --> W
    R --> W
    F --> X[ComparisonArtifact]
    X --> W
```

## Lecture rapide

- La fiche de poste brute est l'entree unique cote recruteur.
- Le `Job Intake Agent` est le premier point ou la logique locale et provider divergent.
- Le systeme peut tourner en `deterministic`, `live_llm` ou `compare`.
- Le fallback est une partie visible du systeme, pas un detail cache.
- Chaque agent important produit un artefact consultable.
- Le `Review Gate Agent` rappelle que la decision finale reste supervisee.

## Ce que ce schema prouve

- decomposition claire des responsabilites
- arbitrage entre chemin local et chemin live
- instrumentation par artefacts
- place explicite de la revue humaine
