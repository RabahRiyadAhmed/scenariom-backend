# Services backend

Le dossier `core/` est le service métier actuel. Lorsqu'un domaine devient autonome, le déplacer
vers un dossier dédié comme `themes/`, `projects/` ou `payments/`, avec ses propres dépendances,
tests, variables d'environnement et contrat d'API interne.

Un dossier ne doit être créé que lorsqu'un vrai service existe : l'arborescence ne simule pas une
séparation qui n'est pas encore implémentée.
