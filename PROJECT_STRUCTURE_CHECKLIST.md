# Project Structure Checklist

Lire cette checklist regulierement pour verifier que le projet reste propre.

## Kickoff

- `AGENT_START.md` existe
- `PROJECT_KICKOFF.md` existe
- le probleme est formule en une phrase
- la demo principale est definie
- le hors-scope V1 est defini

## Pilotage

- `DELIVERY_PLAN.md` existe
- la phase en cours est visible
- `DECISIONS.md` est mis a jour apres chaque arbitrage important

## Repo code

- `README.md` explique le projet simplement
- le `README.md` explique aussi comment lancer, tester et comprendre l'architecture
- `.env.example` existe si necessaire
- le code est dans `src/`
- les tests sont dans `tests/` ou proches du code
- les scripts utilitaires sont dans `scripts/`
- la documentation technique annexe est dans `docs/`
- les fichiers d'instructions projet existent si necessaire :
  - `AGENT_START.md`
  - `docs/MENTOR_MODE_PROTOCOL.md`
  - `docs/UX_UI_GUIDELINES.md`
  - `docs/CLEAN_ARCHITECTURE_RULES.md`

## Hygiene

- pas de secrets versionnes
- pas de `node_modules/` versionne
- pas de builds versionnes inutilement
- pas de medias lourds inutiles dans le repo
- `.gitignore` est coherent
- les variables d'environnement attendues sont documentees
- l'architecture du repo est coherente avec la separation logique / UI / infra

## V1

- la demo principale fonctionne
- le build local passe
- au moins une preuve visuelle existe
- les limites actuelles sont connues

## Passage vers architectAgent

- `project-links.md` cote portfolio pointe vers ce repo
- les assets a reutiliser sont identifies
- les informations necessaires a `project.meta.md` sont disponibles
- la retrospective pourra etre faite a la fin
