# Project Kickoff

Ce document fixe le cap produit et technique avant toute implementation importante.

## Identite du projet

Nom du projet : IA Recruter

Type : Portfolio de systeme multi-agent IA pour le screening de candidatures email

Positionnement : Showcase d'architecture agentique hybride, explicable et supervisee, construit sur un cas d'usage RH concret

Date de lancement : 2026-05-04

Date de recadrage : 2026-05-07

## Objectif reel

Objectif principal : Prouver une competence senior en conception de systemes multi-agents IA, pas seulement une capacite a produire une interface RH demonstrative.

Ce que le projet doit faire comprendre : Le concepteur sait decomposer un probleme metier en agents utiles, arbitrer entre logique deterministe et appels LLM, instrumenter un pipeline, construire des fallbacks, garder l'humain dans la boucle et rendre le tout comprenable en UX.

## Cible

Cible principale : Recruteur tech, CTO, lead IA, evaluateur portfolio ou client potentiel qui veut juger le niveau d'architecture, de produit et de rigueur.

Cible secondaire : Equipe RH ou autre developpeur interesse par les workflows IA supervises.

## Probleme

Probleme metier : Les candidatures email sont longues a lire, difficiles a comparer et rarement tracees de maniere explicable.

Probleme technique plus profond : Beaucoup de demos "agentiques" montrent des agents cosmetiques ou une simple API LLM branchee sans architecture claire, sans fallback et sans supervision humaine.

Pourquoi ce projet vaut la peine : Le screening RH est un cas concret, lisible en quelques secondes, mais suffisamment riche pour montrer extraction, matching, decision, orchestration, explicabilite, comparaison provider et garde-fous.

## Solution

Solution proposee : Construire un systeme de screening RH multi-agent hybride qui combine moteur local deterministe, execution LLM optionnelle, fallback automatique, artefacts visibles, historique de runs et validation humaine avant toute action finale.

Promesse forte : Le projet ne vend pas une "IA magique". Il montre un systeme d'agents fiable, trace, instrumente et limite proprement.

## Ce que le projet doit prouver

- Decomposition metier en agents aux responsabilites nettes
- Choix explicites sur ce qui reste deterministe et ce qui devient LLM
- Gestion de plusieurs modes d'execution
- Traçabilite des runs, etats et artefacts
- Supervision humaine et garde-fous
- UX capable d'expliquer le systeme a un non-technique
- Clean architecture, types, tests et documentation solides

## Competences portfolio explicitement visees

Le projet doit prouver en priorite ces 6 competences :

1. `Architecture de systeme multi-agent`
   - agents nommes
   - responsabilites claires
   - handoffs visibles
   - run engine separe de l'UI
2. `Arbitrage LLM vs deterministe`
   - modes `deterministic`, `live_llm`, `compare`
   - provider demande vs provider effectif
   - fallback explicite
3. `Supervision humaine et gouvernance`
   - review gate
   - aucune action finale automatique
   - limites et garde-fous visibles
4. `Explicabilite et artefacts`
   - artefacts inspectables
   - rationale lisible
   - differences local vs provider visibles
5. `Qualite d'implementation`
   - separation moteur / adaptateurs / UI
   - types solides
   - tests utiles
6. `Pensee produit pour demo technique`
   - UX lisible
   - parcours demonstratif
   - etats vides coherents
   - demo stable sans cle

Si une fonctionnalite ne renforce pas clairement au moins une de ces 6 competences, elle ne doit pas devenir prioritaire.

## Ce que le projet ne cherche pas a prouver

- un ATS complet
- une automatisation finale du recrutement
- une precision RH "reelle" ou scientifiquement validee
- une securite enterprise exhaustive
- un parsing CV ultra avance
- une multiplication d'agents purement cosmetique

## Agents cibles

Le pipeline cible doit montrer au minimum :

1. `Job Intake Agent`
   - lit la fiche de poste brute
   - produit une structure exploitable
   - peut tourner en mode local ou LLM
2. `Candidate Intake Agent`
   - normalise email, metadata, pieces et texte extrait
3. `Extraction Agent`
   - extrait competences, seniorite, preuves, signaux faibles, ambiguïtes
4. `Match Agent`
   - compare profil et fiche critere par critere
   - produit une matrice de matching
5. `Decision Agent`
   - attribue decision, score, confiance et justification
6. `Response Draft Agent`
   - prepare le brouillon de reponse
7. `Review Gate Agent`
   - impose la revue humaine ou le fallback selon les cas

Chaque agent doit produire un artefact visible dans l'interface.

## Modes d'execution a montrer

Le produit doit afficher clairement 3 modes :

1. `Demo deterministic`
   - fonctionne sans cle API
   - stable pour captures, video et deploy public
2. `Live LLM`
   - utilise la cle utilisateur
   - appelle un provider pour extraction et/ou justification
3. `Compare`
   - compare sortie locale et sortie provider
   - montre differences, convergence ou divergence

## Demo principale

Demo principale a reussir :

1. coller une fiche de poste brute
2. lancer un run en mode deterministic
3. observer les agents se relayer
4. voir les artefacts produits
5. obtenir le classement final
6. ouvrir un candidat ambigu
7. comprendre pourquoi le systeme demande une revue ou un complement
8. relancer en mode live ou compare
9. constater ce qui change entre logique locale et fournisseur LLM

Ce qu'un evaluateur doit comprendre en moins de 30 secondes : Ce n'est pas juste une app RH. C'est un systeme agentique hybride, instrumente, explicable et supervise.

## V1 cible apres recadrage

La V1 finale du portfolio doit absolument montrer :

- un mode deterministic stable
- un mode LLM optionnel via BYOK
- un mode compare local vs provider
- un pipeline agentique visible
- des artefacts par etape
- un historique de runs
- une decision finale avec justification
- un bloc de revue humaine / gouvernance

Ce qui peut rester simplifie :

- vraie inbox email live
- parsing CV lourd ou OCR
- persistance serveur
- ATS complet
- envoi reel d'emails
- analytics enterprise

## Ce qui doit rester deterministe

- orchestration des etapes
- historique et persistence locale
- gestion des etats
- fallback policies
- classement et sortie de demo sans provider
- format des artefacts
- garde-fous de revue humaine

## Ce qui doit devenir reellement LLM

- extraction structuree de fiche de poste depuis texte libre
- extraction de signaux candidat depuis email/CV textuel
- justification naturelle de decision
- suggestions de questions de relance
- comparaison multi-provider

## Artefacts visibles obligatoires

- `JobDescriptionArtifact`
- `CandidateProfileArtifact`
- `MatchMatrixArtifact`
- `DecisionArtifact`
- `ResponseDraftArtifact`
- `RunSummaryArtifact`

Chaque artefact doit etre inspectable dans l'UX.

## UX cible

Le projet doit a terme contenir au moins ces surfaces :

1. `Screening Console`
   - input fiche de poste
   - lancement du run
   - progression
   - ranking
   - detail candidat
2. `Agent Trace`
   - pipeline, etats, durees, handoffs, provider, fallback
3. `Artifact Inspector`
   - sortie de chaque agent et difference entre modes
4. `Provider Compare`
   - local vs OpenAI vs Gemini
5. `Governance`
   - revue humaine, limites, garde-fous, avertissements

## Preuves portfolio attendues

- captures de chaque surface cle
- schema d'architecture agentique
- schema de fallback
- run deterministic complet
- run compare
- exemple de divergence local vs provider
- exemple de review gate
- README clair, honnete et technique
- video demo courte avec narration precise

## Securite et limites a montrer

Le projet doit afficher et documenter :

- les cles API restent cote utilisateur si possible
- aucun envoi automatique sans revue humaine
- aucune promesse de precision RH universelle
- limites sur biais, conformite et sensibilite des donnees
- fallback si provider indisponible ou sortie invalide

## Definition de done

Le projet sera considere comme fini quand :

- le mode deterministic est stable et presentable
- le mode LLM fonctionne au moins sur un provider
- le mode compare est visible et utile
- le relay montre de vrais artefacts et pas seulement des statuts
- la supervision humaine est explicite
- les tests couvrent parsing, runs, fallback et rendu critique
- le README raconte l'architecture, les tradeoffs et les limites
- le deploy public montre une demo propre sans tromper sur ce qui est reel ou simule

## Hors scope

- ATS complet
- envoi automatique d'emails
- ingestion massive enterprise
- conformite RH ou legale complete
- securite enterprise multi-tenant

## Decision de lancement

Le projet est-il assez cadre pour continuer ? Oui.

Ordre recommande :

1. recadrer docs et types
2. extraire un vrai run engine
3. introduire modes d'execution et adapters provider
4. rendre les artefacts visibles
5. revoir UX et comparaison
6. renforcer tests et README
