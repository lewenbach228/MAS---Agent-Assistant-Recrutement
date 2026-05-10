# Template Repo Tree

Arborescence conseillee pour un nouveau projet IA ou automatisation avec clean architecture.

```text
project-root/
  .env.example
  .gitignore
  AGENT_START.md
  README.md
  PROJECT_KICKOFF.md
  DELIVERY_PLAN.md
  DECISIONS.md
  package.json
  tsconfig.json
  vite.config.ts
  docs/
    MENTOR_MODE_PROTOCOL.md
    UX_UI_GUIDELINES.md
    CLEAN_ARCHITECTURE_RULES.md
    WORKFLOW_SCHEMA.md
    VIDEO_DEMO_SCRIPT.md
  public/
  scripts/
  src/
    app/
    components/
    features/
    domain/
    services/
    hooks/
    lib/
    styles/
    main.tsx
  tests/
```

## Intention des dossiers

- `app/` : composition globale, pages, shell applicatif
- `components/` : composants UI reutilisables
- `features/` : fonctionnalites decoupees par domaine
- `domain/` : logique metier pure, regles, modeles, use cases
- `services/` : providers, APIs, side effects, infra
- `hooks/` : orchestration React et etat UI
- `lib/` : utilitaires transverses
- `styles/` : tokens, themes, styles globaux
- `tests/` : tests de logique, rendu et non-regression

## Regles simples

- pas de logique metier complexe dans les composants JSX
- pas de provider externe appele directement depuis une vue si on peut l'encapsuler
- tout ce qui peut etre teste sans React doit etre sorti hors composants
- les docs de pilotage restent a la racine
