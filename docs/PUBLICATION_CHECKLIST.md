# Publication Checklist

## Objectif

Cette checklist sert a transformer IA Recruter en preuve publiable, pas seulement en codebase fonctionnelle.

## 1. Verite produit

- Le README explique clairement les 6 competences prouvees.
- Les limites actuelles sont assumees sans survendre le projet.
- Le mode `deterministic` est le comportement public par defaut.
- Le mode `live_llm` est presente comme optionnel et BYOK.
- Le mode `compare` est explique comme preuve d'arbitrage, pas comme gadget.

## 2. Verite technique

- `npm install` fonctionne sans manipulation manuelle.
- `npm run dev` lance la demo locale.
- `npm test` passe.
- `npm run build` passe.
- `.env.example` est coherent avec le projet reel.
- `.gitignore` couvre bien les `.env`, logs et build outputs.

## 3. Verite UX

- Avant le premier run, aucun faux resultat n'est visible.
- Pendant un run, la progression et l'etape active sont lisibles.
- Apres un run, le classement, les details et les artefacts sont coherents.
- Le `compare mode` est compréhensible sans lire le code.
- Le bloc `Governance` rappelle clairement la supervision humaine.

## 4. Assets portfolio

- Captures conformes a `docs/PORTFOLIO_PROOF_PACK.md`.
- Video conforme a `docs/VIDEO_DEMO_SCRIPT.md`.
- Schema d'architecture lisible dans le README et/ou le portfolio externe.
- Message de portfolio coherent avec `docs/CONTENT_ANGLES.md`.

## 5. Publication publique

- La build statique a ete testee avant publication.
- La cible de deploy est choisie : Vercel ou Netlify.
- La page publique reste utile sans cle API.
- Les cles utilisateur ne sont jamais commitees.
- Le projet affiche des messages honnetes quand aucun provider live n'est disponible.

## 6. Avant annonce

- Verifier une derniere fois le README sur GitHub.
- Verifier l'affichage mobile de l'ecran principal.
- Verifier les textes visibles dans l'app.
- Choisir 1 angle principal de post plutot que 5 messages concurrents.
