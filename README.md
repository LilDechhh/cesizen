Ce guide permet de déployer l’application CesiZen en environnement local afin de tester l’ensemble des fonctionnalités.  

Prérequis  

Avant toute installation, les outils suivants doivent être installés : 

Node.js 

Un compte Supabase 
 

Récupération du projet 

Cloner le dépôt Git  

git clone https://github.com/LilDechhh/cesizen.git 
cd cesizen 

Installer les dépendances  

npm install 

Configurer les variables d’environnement  

Créer un fichier .env.local à la racine du projet :  

VITE_SUPABASE_URL=votre_url_supabase 

VITE_SUPABASE_ANON_KEY=votre_cle_supabase 

Initialisation de la base de données  

Copier le contenu du dossier “supabase/migrations/”et l'exécuter dans le "SQL Editor" de Supabase pour que les tables soient créées. 

Lancement de l’application  

Npm run dev 

Lancements des tests  

Exécuter la suite de tests : 

 npm run test:dev 

Résultat attendu : Tous les tests doivent être validés (status “passed”) 

Problèmes fréquents  

Erreur : variables d’environnement non reconnues 
Vérifier le fichier .env.local et redémarrer le serveur 

Erreur de connexion Supabase 
Vérifier les clés API et l’état du projet Supabase 

Port déjà utilisé 
Modifier le port ou fermer l’application concernée 