# Portfolio Proof Pack

## Objectif

Ce pack sert a capturer les preuves qui renforcent les 6 competences portfolio ciblees :

- architecture multi-agent
- arbitrage LLM vs deterministe
- supervision humaine
- explicabilite par artefacts
- qualite d'implementation
- pensee produit pour demo technique

## Positionnement honnete a respecter

Le projet doit etre decrit comme :

- un `pipeline multi-agent local`
- une `demo agentique hybride`
- un systeme multi-etapes explicable avec fallback et revue humaine

Le projet ne doit pas etre decrit comme :

- un `veritable systeme agentique distribue`
- une orchestration inter-services deja industrialisee
- un systeme RH autonome de decision finale

## Captures minimales

1. `Screening` avant premier run
   - montre les etats vides coherents
2. `Screening` apres run deterministic
   - montre la progression et le classement
3. Bloc `Job Intake Agent`
   - montre la sortie structuree du premier agent
4. Detail candidat
   - montre score, rationale, signaux forts, gaps, brouillon
5. `Agent Relay`
   - montre pipeline, provider effectif, fallback si present
6. `Artifact Inspector`
   - montre un artefact metier
7. `ComparisonArtifact`
   - montre `local vs provider`
8. Bloc `Governance`
   - montre revue humaine et limites

## Before / After

- Before : fiche brute + lecture manuelle + peu de tracabilite
- After : pipeline visible + artefacts consultables + compare mode + revue humaine explicite

Lecture correcte du "After" :

- le gain porte sur la lisibilite du pipeline, l'explicabilite et l'arbitrage local vs LLM
- le gain ne prouve pas encore une execution distribuee reelle entre agents separes

## Preuves techniques a mentionner

- `runEngine` separe de l'UI
- adaptateurs provider dedies
- fallback local visible
- premier agent live branche sur la fiche de poste
- compare mode avec artefact dedie
- tests automatiques sur moteur, providers et UI critique

## Formulations portfolio recommandees

- "Architecture multi-agent locale, explicable et supervisee"
- "Pipeline agentique hybride avec fallback deterministe"
- "Premier chemin LLM reel integre a une demo stable"
- "Artefacts intermediaires visibles et comparables"

## Formulations a eviter

- "Systeme agentique distribue en production"
- "Agents autonomes deployes"
- "Orchestration distribuee complete"
- "Automatisation RH de bout en bout"

## Ce qu'il faut assumer explicitement

- les candidatures sont encore seedees
- un seul agent live est branche pour l'instant
- le compare mode est centre sur la fiche de poste
- il n'y a aucun envoi automatique d'email
- le projet ne pretend pas remplacer une decision RH finale
- l'execution reste majoritairement locale et frontend
- les agents ne sont pas encore deployes comme services ou workers separes
