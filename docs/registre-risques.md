# Registre des risques

| Risque | Probabilité | Impact | Criticité | Mesure |
|---|---:|---:|---:|---|
| Accès aux données d’un autre utilisateur | 3 | 4 | 12 | RLS et tests d’autorisation |
| Compte administrateur compromis | 2 | 4 | 8 | Mot de passe fort, contrôle des rôles |
| Secret exposé dans GitHub | 2 | 4 | 8 | Secret scanning et push protection |
| Dépendance vulnérable | 3 | 3 | 9 | Dependabot et CodeQL |
| Compte désactivé encore actif | 2 | 3 | 6 | Déconnexion automatique |
| Indisponibilité Vercel ou Supabase | 2 | 3 | 6 | Supervision et procédure d’incident |
| Suppression involontaire de données | 2 | 3 | 6 | Sauvegarde et confirmation |