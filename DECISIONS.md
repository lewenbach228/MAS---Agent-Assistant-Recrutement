# Decisions

Ce document conserve les arbitrages structurants du projet.

## Format

Date :

Decision :

Pourquoi :

Alternative ecartee :

Impact :

## Decision 1

Date : 2026-05-04

Decision : Positionner IA Recruter comme un copilote de preselction RH multi-agent centre sur une demo claire de tri, justification et brouillons de reponse.

Pourquoi : Ce cadre a permis de lancer vite une V1 demonstrative sans deriver immediatement vers un ATS complet.

Alternative ecartee : Construire des le depart une inbox RH full-stack avec integrations reelles partout.

Impact : Une premiere V1 locale et stable a pu etre livree rapidement.

## Decision 2

Date : 2026-05-04

Decision : Utiliser Vite + React + TypeScript avec donnees seed locales pour etablir la base du produit.

Pourquoi : Cette stack permet une iteration rapide sur UX, types, tests et documentation.

Alternative ecartee : Attendre une architecture backend plus lourde avant de produire une surface visible.

Impact : Le projet dispose d'un shell d'app, de tests de base et d'une demo rejouable.

## Decision 3

Date : 2026-05-05

Decision : Conserver un moteur local deterministe pour garantir la stabilite de la demo initiale.

Pourquoi : Sans ce socle stable, la demo et les captures deviennent trop dependantes d'appels externes.

Alternative ecartee : Construire toute la V1 directement autour d'appels live a des providers.

Impact : Le projet reste montrable sans cle API et peut servir de fallback durable.

## Decision 4

Date : 2026-05-05

Decision : Ajouter une suite de tests minimale pour verrouiller parsing, scoring et rendu critique.

Pourquoi : Une demo portfolio sans filet de securite se degrade trop vite au moindre refactor.

Alternative ecartee : Rester sur une simple verification manuelle.

Impact : Le projet a maintenant une base de validation continue avec `npm test`.

## Decision 5

Date : 2026-05-06

Decision : Ajouter un protocole `mentor mode` pour les prochains projets afin de favoriser apprentissage, explication et progression par etapes.

Pourquoi : L'objectif est de monter en niveau d'architecture et de raisonnement, pas seulement de shipper.

Alternative ecartee : Continuer en mode purement executif ou "vibe coding".

Impact : Les futurs projets peuvent demarrer avec un cadre pedagogique plus fort.

## Decision 6

Date : 2026-05-07

Decision : Repositionner IA Recruter comme portfolio d'architecte agent IA hybride, trace et supervise, plutot que comme simple demo RH.

Pourquoi : Le vrai objectif du projet est de prouver une competence senior en architecture de systemes multi-agents IA.

Alternative ecartee : Continuer a optimiser uniquement la couche UI d'une demo de screening sans rearchitecturer le coeur.

Impact : Les choix suivants devront privilegier modes d'execution, artefacts, instrumentation, fallback, gouvernance et supervision humaine.

## Decision 7

Date : 2026-05-07

Decision : Viser une architecture hybride avec trois modes visibles : `deterministic`, `live llm` et `compare`.

Pourquoi : Ce compromis montre a la fois robustesse systeme, integrabilite provider et maturite dans les tradeoffs.

Alternative ecartee : Tout faire en logique locale ou tout faire via LLM.

Impact : Le produit devra introduire une couche d'adaptateurs provider et un vrai moteur de comparaison.

## Decision 8

Date : 2026-05-07

Decision : Chaque agent devra produire un artefact consultable, pas seulement un statut d'etape.

Pourquoi : Un systeme agentique credibilise mieux son architecture quand les sorties intermediaires sont visibles, testables et auditables.

Alternative ecartee : Conserver un relay principalement cosmetique avec traces textuelles minimales.

Impact : Les types, l'UX et les tests devront evoluer autour d'artefacts structures.

## Decision 9

Date : 2026-05-07

Decision : Garder la revue humaine comme garde-fou structurel et ne jamais presenter le systeme comme un moteur de decision autonome.

Pourquoi : C'est plus honnete, plus defensable et plus mature sur un sujet RH sensible.

Alternative ecartee : Donner une impression d'automatisation finale du recrutement.

Impact : La gouvernance, les avertissements et les fallbacks devront etre visibles dans le produit et la doc.

## Decision 10

Date : 2026-05-08

Decision : Prioriser uniquement les fonctionnalites qui prouvent explicitement les 6 competences portfolio ciblees : architecture multi-agent, arbitrage LLM vs deterministe, supervision humaine, explicabilite par artefacts, qualite d'implementation et pensee produit pour demo technique.

Pourquoi : Sans cette regle, le projet risque de deriver vers des ajouts RH secondaires, des integrations cosmetiques ou une complexite non demonstrative.

Alternative ecartee : Continuer a ajouter des features au fil des idees sans les rattacher a une competence clairement prouvable dans la demo.

Impact : Chaque evolution devra etre justifiee par la competence qu'elle renforce. Les ajouts hors cible deviennent non prioritaires, meme s'ils sont techniquement possibles.

## Decision 11

Date : 2026-05-09

Decision : Classer IA Recruter comme `pipeline multi-agent local` avec un premier chemin LLM reel, et non comme `veritable systeme agentique distribue`.

Pourquoi : Les roles agents, les artefacts, les modes d'execution et le fallback sont reels dans la logique produit, mais l'execution reste essentiellement orchestree dans une application frontend locale. Il n'y a pas encore d'agents deployes comme services ou workers separes, pas de communication inter-service explicite, pas de persistance durable serveur ni de supervision distribuee.

Alternative ecartee : Presenter le projet comme un systeme agentique distribue complet sur la base d'un relay visible et d'un provider LLM branche sur une etape.

Impact : Le README, la demo et les contenus portfolio doivent utiliser un vocabulaire honnete : `pipeline multi-agent local`, `demo agentique hybride`, `systeme multi-etapes explicable`. Le mot `distribue` doit etre reserve a une future V2 avec orchestration reelle, persistance, traces d'execution inter-processus et gestion d'echec observable.
