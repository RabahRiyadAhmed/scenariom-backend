# Backend Scenariom

- `gateway/` est le point d'entrée public et gère l'authentification.
- `services/core/` contient temporairement les domaines métier encore regroupés.
- `services/*/` accueillera progressivement les microservices autonomes.
- `doc/` contient la documentation backend.

Chaque service backend possède son propre `package.json`, son propre lockfile et son propre cycle
de déploiement. Il ne fait pas partie du workspace pnpm frontend.

Le dossier `backend/` constitue un dépôt Git autonome. Son `.gitignore` protège tous les services,
tandis que les `.gitignore` locaux peuvent ajouter des règles propres à un service.
