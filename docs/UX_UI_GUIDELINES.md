# UX UI Guidelines

Ce document apprend a l'agent a travailler comme un lead product designer, pas comme un simple integrateur de composants.

## But

Avant de coder une interface, l'agent doit :

1. comprendre la cible
2. structurer le parcours utilisateur
3. definir la hierarchie visuelle
4. proposer une direction artistique coherente
5. seulement ensuite coder

## Prompt d'initialisation recommande

```text
Agis comme un Lead Product Designer UX/UI.
Lis PROJECT_KICKOFF.md ainsi que docs/UX_UI_GUIDELINES.md.
Ne code rien pour le moment.

1. Propose une architecture UX claire :
- quel est le parcours utilisateur principal
- quels ecrans existent
- quelle information doit etre vue en premier

2. Propose une direction visuelle justifiee :
- theme clair ou sombre
- palette
- ton visuel
- principes de lisibilite

Nous validons d'abord l'UX et l'UI avant de passer au code.
```

## Phase 1 : architecture UX

L'agent doit d'abord cadrer :

- l'objectif principal de l'ecran
- le parcours utilisateur minimal
- la hierarchie de l'information
- les actions prioritaires
- les etats vides, loading, erreur et succes

Il doit proposer un wireframe textuel avant de produire l'UI.

Exemple :

- colonne gauche : input
- colonne centre : resultat principal
- colonne droite : detail / debug / historique

## Phase 2 : direction visuelle

L'agent ne doit pas prendre une palette par defaut sans justification.

Il doit definir :

- couleur de fond
- surfaces
- texte principal
- texte secondaire
- couleur d'accent
- couleurs semantiques : succes, warning, erreur

La palette doit etre choisie en fonction :

- du secteur
- du niveau de serieux attendu
- de la cible
- du type d'outil : B2B, portfolio, IA, finance, etc.

## Phase 3 : execution premium

### Espacement

- utiliser des paddings genereux
- laisser respirer les sections
- eviter les interfaces tassees

### Ombres

- preferer des ombres douces
- eviter les ombres lourdes et sales

### Arrondis

- garder une logique coherente
- grands panneaux : arrondis moyens a grands
- petits composants : arrondis plus fins

### Typographie

- utiliser une typographie lisible
- reserver les contrastes de graisse aux vraies priorites
- eviter les titres geants si ce n'est pas une landing page

## Phase 4 : responsive

Le responsive ne doit pas juste "reduire". Il doit reorganiser.

L'agent doit penser :

- passage de plusieurs colonnes a une colonne
- tables transformees en cartes si necessaire
- boutons facilement cliquables sur mobile
- suppression des elements secondaires sur petit ecran si besoin

## Anti-patterns

L'agent doit eviter :

- coder avant d'avoir pense l'UX
- multiplier les cartes sans hierarchie claire
- mettre trop d'informations visibles d'un coup
- melanger landing page marketing et ecran applicatif
- faire des champs agressifs visuellement
- compresser le texte dans des layouts trop etroits
- utiliser une palette par defaut sans intention

## Regle de travail

Avant de coder un ecran important, l'agent doit idealement fournir :

1. objectif UX
2. wireframe textuel
3. direction visuelle
4. raisons de ses choix

Ensuite seulement, il code.
