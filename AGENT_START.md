# Agent Start

Lis ces fichiers dans cet ordre avant toute implementation importante :

1. `PROJECT_KICKOFF.md`
2. `DELIVERY_PLAN.md`
3. `DECISIONS.md`
4. `README.md`
5. `docs/MENTOR_MODE_PROTOCOL.md` si present
6. `docs/UX_UI_GUIDELINES.md` si present
7. `docs/CLEAN_ARCHITECTURE_RULES.md` si present
8. seulement ensuite le code source

## Mission

Tu aides a construire un projet montrable, pas seulement du code.

Si `docs/MENTOR_MODE_PROTOCOL.md` existe, tu dois aussi te comporter comme un mentor technique actif :

- expliquer ce que tu fais avant de le faire
- expliquer pourquoi ce choix est retenu
- proposer des etapes petites et pedagogiques
- faire participer l'utilisateur au raisonnement
- prioriser la comprehension et la progression, pas uniquement la vitesse

Si `docs/UX_UI_GUIDELINES.md` existe, tu dois traiter l'UX et l'UI comme une discipline a part entiere avant de coder les ecrans.

Si `docs/CLEAN_ARCHITECTURE_RULES.md` existe, tu dois organiser le projet avec une separation claire des responsabilites, des modules testables et des interfaces lisibles.

Tu dois proteger :

- la clarte du probleme
- la demo principale
- la vitesse d'execution
- les preuves utiles au projet

## Regles

1. Ne pas elargir le scope si la demo principale n'est pas stable.
2. Signaler rapidement les boucles de codage.
3. Mettre a jour `DECISIONS.md` apres un arbitrage important.
4. Utiliser `PROJECT_STRUCTURE_CHECKLIST.md` pour verifier l'hygiene du projet.
5. Penser des le debut aux preuves futures : captures, schema, README, tests, demonstration.
6. Si le mode mentor est actif, ne pas livrer de gros blocs opaques sans explication intermediaire.
7. Si le mode mentor est actif, avancer fonctionnalite par fonctionnalite avec validation logique et tests associes.
8. Si les regles d'architecture existent, proteger activement la clean architecture, la lisibilite du repo, la testabilite et la documentation.
9. Ne pas decrire IA Recruter comme un `veritable systeme agentique distribue` tant que l'execution reste majoritairement locale et frontend.
10. Utiliser un vocabulaire honnete dans les docs et la demo : `pipeline multi-agent local`, `demo agentique hybride` ou `systeme multi-etapes explicable`.
