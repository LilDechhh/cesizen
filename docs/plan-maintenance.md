# Plan de maintenance

## Outils utilisés

- GitHub Issues pour les anomalies et évolutions
- GitHub Projects pour le suivi Kanban
- GitHub Actions pour lint, tests et build
- Dependabot pour les dépendances
- CodeQL pour l’analyse du code
- Vercel pour le déploiement

## Types de maintenance

- corrective : correction d’anomalies
- évolutive : ajout de fonctionnalités
- préventive : mises à jour et sécurité
- adaptative : adaptation aux évolutions techniques

## Cycle de traitement d’un ticket

1. Création du ticket
2. Qualification et priorisation
3. Ajout au Kanban
4. Création d’une branche
5. Développement
6. Tests
7. Pull request
8. Validation de la CI
9. Fusion dans `main`
10. Déploiement automatique
11. Fermeture du ticket

## Priorités

| Priorité | Exemple |
|---|---|
| Haute | sécurité, authentification bloquée |
| Moyenne | fonctionnalité dégradée |
| Faible | amélioration visuelle ou documentaire |

## Veille technologique

Une veille régulière est réalisée sur :

- React
- Vite
- Supabase
- Vercel
- GitHub
- OWASP
- CNIL