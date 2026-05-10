# Technical Plan V1

## Cap technique actuel

- Frontend : `Vite + React + TypeScript`
- Source de verite de demo : donnees seed locales
- Moteur d'execution : `src/lib/runEngine.ts`
- Couche provider : `src/infrastructure/providers/providerAdapters.ts`
- Etat UI : `src/hooks/useRecruiterDemo.ts`
- Tests : `Vitest + Testing Library`

## Architecture retenue

Le projet est maintenant structure autour de 4 couches visibles :

1. `Domain`
   - types metier
   - evaluations
   - decisions
2. `Application`
   - run engine
   - construction des blueprints
   - artefacts
3. `Infrastructure`
   - adaptateurs provider
   - resolution du mode d'execution
   - fallback local
4. `Presentation`
   - console de screening
   - relay agentique
   - inspection des artefacts

## Modes d'execution

- `deterministic`
  - preview stable
  - aucun provider requis
- `live_llm`
  - premier agent live branche : `Job Intake Agent`
  - provider : OpenAI ou Gemini selon cle BYOK
  - fallback local si erreur ou cle absente
- `compare`
  - compare parse local et extraction provider sur la fiche de poste
  - expose un `ComparisonArtifact`

## Types publics importants

- `ExecutionMode`
- `RunArtifact`
- `AgentExecutionStep`
- `CandidatePipelineResult`
- `ScreeningRunBlueprint`
- `RunRecord`

## Ce qui est reel aujourd'hui

- run engine separe de l'UI
- artefacts consultables
- fallback visible
- compare mode centre sur la fiche de poste
- premier chemin live pour la structuration de fiche

## Ce qui reste a etendre

- extraction live cote candidat
- justification LLM sur la decision
- comparaison provider sur des agents supplementaires
- validation plus forte des sorties provider

## Pourquoi cette architecture est la bonne pour ce portfolio

- elle montre une separation nette des responsabilites
- elle prouve l'arbitrage deterministe vs provider
- elle rend le fallback visible et testable
- elle permet d'ajouter des agents live sans casser la demo stable
