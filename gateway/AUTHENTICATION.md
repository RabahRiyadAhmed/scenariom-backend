# Authentification Scenariom

## Transport des jetons

- Web Next.js : utiliser uniquement `/api/auth/web/*` avec `credentials: "include"`. Les jetons ne sont jamais présents dans la réponse JSON et restent dans des cookies `HttpOnly`.
- Expo natif : utiliser uniquement `/api/auth/mobile/*`. Stocker les jetons avec `expo-secure-store`, jamais avec AsyncStorage.
- Le jeton d’accès dure 15 minutes. La session de rafraîchissement dure 30 jours, est hachée en PostgreSQL et tourne à chaque utilisation.
- Redis est la première vérification de session de la gateway. Un JWT valide dont la session Redis est absente ou révoquée est refusé.

## Routes

```text
POST /api/auth/web/register
POST /api/auth/web/login
POST /api/auth/web/refresh
POST /api/auth/web/logout

POST /api/auth/mobile/register
POST /api/auth/mobile/login
POST /api/auth/mobile/refresh
POST /api/auth/mobile/logout

GET  /api/auth/me
```

Inscription : `{ "email": "...", "displayName": "...", "password": "..." }`.
Connexion : `{ "email": "...", "password": "..." }`.

## Initialisation PostgreSQL

1. Copier les variables de `.env.example` dans `.env` et remplacer toutes les valeurs sensibles.
2. Générer au moins 32 octets aléatoires distincts pour `JWT_ACCESS_SECRET` et `COOKIE_SECRET`, puis renseigner `REDIS_PASS` avec le mot de passe du conteneur Redis.
3. Appliquer la migration avec `pnpm prisma:deploy` sur un environnement déployé, ou `pnpm prisma:migrate` en développement.
4. Lancer `pnpm prisma:generate` après toute modification de `schema.prisma`.

Ne jamais exécuter `prisma migrate reset` sur une base contenant des données utiles.
