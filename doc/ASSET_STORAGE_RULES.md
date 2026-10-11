# Règles de stockage des assets

## Source de vérité

Les assets définitifs appartiennent au backend. Next.js et Expo les chargent uniquement par la gateway. Les assets présents dans une application frontend sont réservés à son bootstrap natif ou à un exemple temporaire.

## Transport HTTP

Le service propriétaire détermine le type MIME réel du fichier. La gateway transmet le contenu et ce type sans le remplacer. Le fallback autorisé est `application/octet-stream`.

Formats image actuellement autorisés : SVG (`image/svg+xml`), PNG (`image/png`), JPEG (`image/jpeg`) et WebP (`image/webp`).

## Règles spécialisées futures

- SVG : icônes, formes et illustrations vectorielles contrôlées ; validation et nettoyage obligatoires avant publication.
- PNG : transparence ou rendu pixel exact.
- JPEG : photographie sans transparence.
- WebP : diffusion optimisée lorsque les clients ciblés le supportent.
- Audio, vidéo et documents : modules, quotas, validations et stockage dédiés avant leur activation.

Le nom, l'extension, la taille, le type détecté et le chemin autorisé doivent être validés côté service. Le type fourni par le client ne constitue jamais une preuve.
