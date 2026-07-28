# Tests des règles RLS

## Environnement

- Supabase local
- Données fictives
- Deux comptes utilisateurs
- Un compte administrateur

## Résultats

| Test | Résultat attendu | Résultat obtenu | Statut |
|---|---|---|---|
| Un utilisateur lit ses séances | Ses propres séances sont visibles | À compléter | À tester |
| Un utilisateur lit les séances d’un autre | Aucune ligne retournée | À compléter | À tester |
| Modification d’une séance étrangère | Modification refusée | À compléter | À tester |
| Suppression d’une séance étrangère | Suppression refusée | À compléter | À tester |
| Accès sans authentification | Aucune donnée privée | À compléter | À tester |
| Accès administrateur par utilisateur standard | Refusé | À compléter | À tester |
| Accès administrateur par administrateur | Autorisé | À compléter | À tester |
| Compte désactivé | Session interrompue | À compléter | À tester |

## Conclusion

Les règles RLS doivent garantir que les autorisations sont appliquées directement en base de données, indépendamment des contrôles présents dans l’interface React.