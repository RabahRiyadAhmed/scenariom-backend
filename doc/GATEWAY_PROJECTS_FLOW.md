# Flux Gateway → Projects

## Responsabilités

- `scenariom-web` et `scenariom-app` appellent uniquement `http://localhost:4000/api`.
- `scenariom-gateway` valide Passport/JWT et vérifie la session Redis.
- La gateway transmet l'identifiant validé au service avec un secret interne.
- `scenariom-back`, sur `127.0.0.1:7777`, vérifie le secret puis contrôle `ProjectAccess`.

Le service Projects ne valide jamais un JWT client et ne doit pas être exposé publiquement.

## Routes publiques via la gateway

- `GET /api/projects` : projets visibles par l'utilisateur connecté.
- `POST /api/projects` : crée un projet et donne toutes les actions au propriétaire.
- `GET /api/projects/:id` : exige `VIEW`.
- `PATCH /api/projects/:id` : exige `EDIT_PROJECT`.
- `DELETE /api/projects/:id` : exige `DELETE_PROJECT`.
- `POST /api/projects/:id/access` : exige `MANAGE_ACCESS`.

Exemple d'accès :

```json
{
  "userId": "uuid-de-l-utilisateur",
  "actions": ["VIEW", "EDIT_PROJECT"],
  "note": "Peut écrire, sans gérer les membres"
}
```

## Démarrage local

Après avoir arrêté les anciens processus Nest :

```powershell
cd D:\scenariom\backend\gateway
pnpm install
pnpm prisma:generate
pnpm start:dev

cd D:\scenariom\backend\services\core
pnpm install
pnpm prisma:generate
pnpm prisma:deploy
pnpm prisma:seed
pnpm start:dev
```

Les deux `.env` doivent contenir exactement la même valeur `INTERNAL_SERVICE_SECRET`.
