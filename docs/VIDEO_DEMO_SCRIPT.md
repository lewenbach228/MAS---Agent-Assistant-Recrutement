# Video Demo Script

## Format cible

- Duree : 75 a 120 secondes
- Objectif : faire comprendre en moins de 30 secondes quelles competences le projet prouve

## Fil narratif

1. Ouvrir `Screening`
   - dire : "Ce projet portfolio me sert a prouver une architecture multi-agent locale, hybride et supervisee."
2. Montrer la fiche brute et les modes `deterministic / live_llm / compare`
   - dire : "Je peux arbitrer entre logique locale stable et provider live."
3. Lancer un run deterministic
   - montrer la progression
   - montrer le ranking final
4. Montrer le bloc `Job Intake Agent`
   - dire : "Le premier agent structure la fiche de poste avant tout matching."
5. Ouvrir un candidat
   - montrer rationale, score, brouillon, points a verifier
6. Passer dans `Agent Relay`
   - montrer pipeline, provider effectif, fallback
7. Ouvrir `Artifact Inspector`
   - montrer un `DecisionArtifact`
8. Basculer en `compare`
   - relancer
   - montrer `ComparisonArtifact`
   - dire : "Je peux comparer le parse local et la sortie provider."
9. Montrer `Governance`
   - dire : "La decision reste supervisee, aucun envoi automatique."

## Formulations a privilegier a l'oral

- "pipeline multi-agent local"
- "demo agentique hybride"
- "architecture explicable avec fallback"
- "premier chemin LLM reel sur une etape ciblee"

## Formulations a eviter a l'oral

- "systeme agentique distribue"
- "agents autonomes deployes"
- "orchestration inter-services complete"
- "recrutement automatise de bout en bout"

## Message final a faire passer

"Le projet prouve ma capacite a concevoir un pipeline multi-agent local tracable, a arbitrer entre deterministe et provider, a rendre les artefacts inspectables et a garder l'humain dans la boucle."

## Note de verite a respecter

Si tu evoques les limites pendant la video, dis explicitement :

- "ce n'est pas encore un veritable systeme agentique distribue"
- "l'execution reste majoritairement locale"
- "un seul chemin LLM est branche en reel dans cette V1"

## Captures a prendre pendant la video

- ecran principal avant run
- ecran principal apres run
- bloc `Job Intake Agent`
- detail candidat
- relay avec fallback ou provider
- comparison artifact
- bloc governance
