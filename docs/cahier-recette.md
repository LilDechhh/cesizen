# Cahier de Recette - CesiZen

## 1. Objectif et périmètre
Ce cahier de recette valide les parcours critiques de l'application CesiZen sur 3 modules:
- Module Auth/Profil
- Module Exercice de Respiration 
- Module Administration

## 2. Environnement de test
- Frontend: React + Vite
- Base: Supabase (environnement de test ou staging)
- Navigateurs: Chrome (desktop/mobile), Safari iOS

## Module 1 - Auth / Profil

### TC-AUTH-01 Connexion valide
- Préconditions: utilisateur actif existant.
- Étapes:
  1. Ouvrir `/connexion`.
  2. Saisir un email et mot de passe valides.
  3. Cliquer sur `Se connecter`.
- Résultat attendu:
  - Redirection vers `/profil`.
  - Affichage des informations profil.

### TC-AUTH-02 Validation formulaire (email invalide)
- Préconditions: page de connexion ouverte.
- Étapes:
  1. Saisir `abc` dans email.
  2. Saisir un mot de passe quelconque.
  3. Cliquer `Se connecter`.
- Résultat attendu:
  - Message Zod: `Veuillez entrer une adresse e-mail valide.`
  - Aucun appel API de connexion.

### TC-AUTH-03 Bascule connexion/inscription
- Préconditions: page de connexion ouverte.
- Étapes:
  1. Cliquer `Créer un compte`.
  2. Vérifier le texte `Rejoignez CesiZen`.
  3. Cliquer `Se connecter` pour revenir.
- Résultat attendu:
  - Le formulaire bascule correctement entre les deux modes.

### TC-PROFIL-01 Mise à jour profil
- Préconditions: utilisateur connecté.
- Étapes:
  1. Modifier prénom/nom.
  2. Cliquer `Enregistrer les modifications`.
- Résultat attendu:
  - Message de succès.
  - Valeurs persistées après refresh.

### TC-PROFIL-02 Historique des 10 dernières séances
- Préconditions: utilisateur connecté avec séances existantes.
- Étapes:
  1. Aller sur `/profil`.
- Résultat attendu:
  - Affichage date, mode respiratoire (jointure), durée formatée.
  - Limite à 10 séances.

## Module 2 - Exercice de Respiration

### TC-EXO-01 Lancement exercice
- Préconditions: modes respiratoires disponibles.
- Étapes:
  1. Aller sur `/exercice`.
  2. Cliquer `Commencer` sur un mode.
- Résultat attendu:
  - Redirection vers `/breathing_exercice`.
  - Le mode choisi est affiché.

### TC-EXO-02 Cycle animation synchronisé
- Préconditions: exercice démarré.
- Étapes:
  1. Observer un cycle complet.
- Résultat attendu:
  - Inspiration: cercle grandit pendant `temps_inspiration`.
  - Apnée: cercle reste à taille max pendant `temps_apnee`.
  - Expiration: cercle rétrécit pendant `temps_expiration`.

### TC-EXO-03 Timers en direct
- Préconditions: exercice démarré.
- Étapes:
  1. Observer `Phase en cours`.
  2. Observer `Durée totale`.
- Résultat attendu:
  - Le timer de phase diminue correctement.
  - La durée totale augmente chaque seconde.

### TC-EXO-04 Fin exercice + feedback
- Préconditions: exercice en cours.
- Étapes:
  1. Cliquer `Terminer`.
  2. Choisir un ressenti 1..5.
  3. Cliquer `Valider et terminer`.
- Résultat attendu:
  - Séance insérée en base (`seance`).
  - Redirection vers `/profil`.

## Module 3 - Administration

### TC-ADM-01 Accès admin sécurisé
- Préconditions: utilisateur non admin connecté.
- Étapes:
  1. Ouvrir `/admin`.
- Résultat attendu:
  - Redirection vers `/`.

### TC-ADM-02 Création article
- Préconditions: compte admin connecté.
- Étapes:
  1. Ouvrir onglet `Contenus`.
  2. Cliquer `Nouvel article`.
  3. Saisir titre et contenu.
  4. Soumettre.
- Résultat attendu:
  - Article ajouté à la liste sans rechargement.

### TC-ADM-03 Activation/Désactivation utilisateur
- Préconditions: compte admin connecté.
- Étapes:
  1. Ouvrir onglet `Utilisateurs`.
  2. Cliquer l'action d'activation/désactivation.
- Résultat attendu:
  - Le badge de statut est mis à jour.
  - Le changement est persisté en base.

### TC-ADM-04 Responsive utilisateurs
- Préconditions: compte admin connecté.
- Étapes:
  1. Vérifier desktop >= 768px.
  2. Vérifier mobile < 768px.
- Résultat attendu:
  - Desktop: tableau complet.
  - Mobile: cartes utilisateur lisibles.

## 5. Tests automatisés à exécuter
- Unitaires: `npm run test:run -- src/services/adminService.test.ts`
- Fonctionnels: `npm run test:run -- src/components/login-form.test.tsx`
- Non-régression UI (snapshot): `npm run test:run -- src/components/navbar.test.tsx`

## 6. Critères de sortie
- 100% des tests critiques ci-dessus passants.
- Aucune régression bloquante sur Auth, Exercice, Admin.
- Build production OK (`npm run build`).
