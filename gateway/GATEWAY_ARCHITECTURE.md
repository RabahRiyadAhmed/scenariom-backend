# Gateway Scenariom

Le backend Nest actuel est le point d’entrée public sur le port `4000`. Next.js reste sur `3000`.

```text
Next / Expo
     │
     ▼
Gateway Nest :4000
     ├── validation DTO / rate limit
     ├── Passport local / JWT
     ├── vérification de session Redis
     ├── cookies HttpOnly pour Next
     └── jetons SecureStore pour Expo
              │
              ├── PostgreSQL / Prisma (utilisateurs et sessions durables)
              └── futurs microservices privés
```

## Responsabilités

La gateway peut authentifier, vérifier les autorisations, appliquer les limites, ajouter l’identité de l’utilisateur à une requête interne et router vers un service connu. Elle ne doit pas contenir progressivement toute la logique métier des futurs services.

Redis accélère la validation et la révocation des sessions. PostgreSQL reste la source durable. Si Redis est indisponible, les routes protégées échouent de manière fermée au lieu d’accepter un jeton non vérifié.

Les futurs services ne doivent pas être exposés directement à Internet. Ils devront accepter uniquement le réseau interne et une identité transmise par la gateway via un mécanisme signé ou un transport Nest privé. Le proxy générique vers une URL fournie par le client est interdit afin d’éviter les failles SSRF.

## État actuel

- Authentification et contrôle de profil : implémentés dans la gateway.
- Redis session check : implémenté dans Passport JWT.
- Proxy Next `proxy.ts` : vérifie `/auth/me`, tente un refresh, puis protège Projets/Organisation/Éditeur.
- Routage vers des microservices : à ajouter service par service lorsqu’ils existent.
