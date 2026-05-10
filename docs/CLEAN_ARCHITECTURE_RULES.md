# Clean Architecture Rules

Ce fichier fixe les regles d'organisation de code pour les prochains projets.

## But

Construire un projet :

- lisible
- testable
- evolutif
- separant clairement logique metier, orchestration et presentation

## Principes

1. La logique metier ne doit pas dependre de l'UI.
2. Les composants React ne doivent pas embarquer des regles metier complexes.
3. Les donnees seed, providers, services externes et details d'infrastructure doivent etre isoles.
4. Les fonctions importantes doivent etre testables sans navigateur si possible.
5. Les decisions d'architecture doivent etre explicites dans `DECISIONS.md`.

## Structure recommandee

Pour un projet front ou full-stack leger :

```text
src/
  app/              # composition globale, bootstrap, pages
  components/       # UI reutilisable
  features/         # fonctionnalites par domaine
  domain/           # logique metier pure, modeles, regles, use cases
  services/         # acces API, providers, side effects
  lib/              # utilitaires transverses
  hooks/            # hooks react, sans logique metier lourde
  styles/           # tokens, themes, styles globaux
tests/
docs/
scripts/
```

## Regles concrètes

- Une feature importante doit avoir un point d'entree clair.
- La logique de scoring, parsing, workflow ou securite ne doit pas etre cachee dans un composant JSX.
- Toute logique qui peut etre testee hors React doit etre extraite dans `domain/` ou `lib/`.
- Les providers externes doivent etre encapsules derriere une interface simple.
- Les types publics du projet doivent etre centralises ou au moins coherents.

## Regles React

- Les composants presentent des donnees et declenchent des actions.
- Les hooks orchestrent l'etat et les interactions.
- Les fonctions pures calculent, parsent, classent, valident.
- Les ecrans ne doivent pas devenir des fichiers "god component".

## Regles README

Le README doit toujours contenir :

1. ce que fait le projet
2. pourquoi il existe
3. la demo principale
4. comment lancer le projet
5. comment lancer les tests
6. les variables d'environnement
7. les limites de la V1

## Regles de tests

- une logique metier importante = un test
- un ecran principal = au moins un test de rendu minimal
- un bug corrige important = idealement un test de non-regression

## Regles de documentation

- toute decision importante va dans `DECISIONS.md`
- tout changement de phase va dans `DELIVERY_PLAN.md`
- toute hypothese produit importante doit etre visible dans `PROJECT_KICKOFF.md`
