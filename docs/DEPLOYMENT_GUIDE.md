# Deployment Guide

## Cible recommandee

Le projet est une build statique Vite. La cible la plus simple et la plus honnete pour une demo portfolio est :

- `Vercel`
- ou `Netlify`

Le comportement public recommande :

- mode `deterministic` par defaut
- `live_llm` et `compare` disponibles uniquement si l'utilisateur saisit sa propre cle

## Pre-check locale

Executer avant tout deploy :

```bash
npm install
npm test
npm run build
```

## Variables d'environnement

La demo publique n'a besoin d'aucune variable d'environnement pour fonctionner en mode `deterministic`.

Le fichier `.env.example` n'est qu'un repere documentaire :

- `OPENAI_API_KEY`
- `GEMINI_API_KEY`
- `VITE_DEFAULT_PROVIDER`
- `VITE_DEFAULT_MODEL`

Aujourd'hui, la logique principale repose sur le mode `BYOK` dans l'interface.

## Vercel

1. Importer le repo.
2. Garder le framework detecte `Vite` ou utiliser le fichier `vercel.json` deja present.
3. Verifier les commandes :
   - Build command : `npm run build`
   - Output directory : `dist`
4. Ne configurer aucune variable d'environnement obligatoire pour la V1 publique.
5. Deployer.

## Netlify

1. Connecter le repo.
2. Utiliser le fichier `netlify.toml` deja present ou configurer :
   - Build command : `npm run build`
   - Publish directory : `dist`
3. Ne configurer aucune variable d'environnement obligatoire pour la V1 publique.
4. Deployer.

## Verification post-deploy

- La home charge sans cle API.
- Le premier run `deterministic` fonctionne.
- Le `compare mode` degrade proprement si aucune cle n'est fournie.
- Le `Playground` affiche clairement que la cle est utilisateur.
- Aucun secret n'apparait dans les logs ou dans le code publie.

## Ce qu'il ne faut pas faire

- rendre le deploy dependant d'une cle perso committee
- faire croire que tout le pipeline est live alors qu'un seul agent l'est
- masquer les fallbacks
- activer un envoi automatique d'email pour la demo portfolio
