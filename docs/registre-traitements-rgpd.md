# Registre des traitements RGPD

| Traitement | Finalité | Données | Base légale | Durée de conservation | Mesures |
|---|---|---|---|---|---|
| Création de compte | Fournir un espace personnel | E-mail, identifiant | Exécution du service | Durée du compte | Authentification Supabase, RLS |
| Gestion du profil | Personnaliser le compte | Nom, prénom, e-mail | Exécution du service | Durée du compte | Accès limité à l’utilisateur |
| Séances de respiration | Afficher l’historique | Date, durée, mode | Exécution du service | Durée définie par le projet | RLS, limitation d’accès |
| Administration | Gérer les contenus et utilisateurs | Rôle, statut du compte | Intérêt légitime | Durée du compte | Contrôle administrateur |
| Journaux techniques | Diagnostiquer les erreurs | Informations techniques | Intérêt légitime | Durée limitée | Aucun mot de passe dans les logs |

## Droits des utilisateurs

- accès aux données ;
- rectification ;
- suppression ;
- limitation du traitement ;
- demande d’export.

## Principes appliqués

- minimisation des données ;
- accès limité par rôle ;
- aucun secret dans le dépôt ;
- données chiffrées lors des échanges HTTPS ;
- conservation limitée ;
- suppression ou anonymisation sur demande.