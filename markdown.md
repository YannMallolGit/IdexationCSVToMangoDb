
# Documentation du Processus d'Indexation

## Introduction
Cette documentation décrit le processus d'indexation des données à partir d'un fichier CSV dans une base de données MongoDB. L'objectif est de décomposer un fichier CSV volumineux en parties plus petites, puis d'indexer ces parties dans MongoDB pour faciliter les requêtes et l'analyse.

## Pré-requis
Avant de commencer, assurez-vous d'avoir les éléments suivants :
- Node.js installé sur votre système.
- Npm installé sur votre système.
- MongoDB opérationnel (local).
- lancer la commande `npm i`

## Structure du Projet
Le projet se compose des éléments suivants :
- Un script JavaScript principal (`index.js`) qui gère le processus d'indexation.
- Un script `script generate_files.js` permettant de générer dans le dossier Output les fichier .csv
- Un fichier de configuration PM2 (`process.json`) pour paralléliser les tâches.
- un fichier `package.json` pour gérer les dépendances npm du projets.
- une image `diagrammeDactivitéUML.png` représentant l'UML du processus
- un dossier output vide, qui contiendra l'ensemble des fichiers `sirene-n.csv` une fois le fichier principal décomposé ( Les fichiers CSV source sont créées à partir du `script generate_files.js` et du fichier `StockEtablissement_utf8.csv`)

## Étapes du Processus
1. **Téléchargement des Données**
   - Téléchargez le fichier CSV depuis le site web [data.gouv.fr](https://www.data.gouv.fr/fr/datasets/base-sirene-des-entreprises-et-de-leurs-etablissements-siren-siret/).

2. **Décomposition du CSV**
   - Utilisez le script `generate_files.js` pour diviser le fichier CSV en parties plus petits fichiers, stocké dans dans un dossier`output` .

3. **Indexation dans MongoDB**
   - Utilisez `mongoose` pour connecter MongoDB et créer un modèle pour les données.
   - Importez chaque partie du CSV dans MongoDB.
   - Appliquez des index appropriés pour améliorer la vitesse des requêtes.

4. **Utilisation de PM2**
   - Utilisez PM2 pour paralléliser le processus d'indexation.
   - Configurez le fichier `process.json` pour répartir les tâches entre plusieurs workers.
   - Assurez-vous que le script peut être mis en pause et repris en utilisant `pm2 stop indexation-worker` et `pm2 start indexation-worker`
   - Pour surveiller les performances en temps réel:  `pm2 monit`
## Schéma du Processus
Le diagramme UML dans le répertoire montre le flux du processus d'indexation, de la décomposition des fichiers CSV à l'indexation dans MongoDB.

## Instructions d'Exécution
1. Ouvrez un terminal
2. Accédez au répertoire où se trouve le script d'indexation.
3. Assurer vous d'avoir une BDD MongoDB opérationnel
4. Installez les dépendances nécessaires : `npm i`
5. Démarrez le processus avec PM2 : `pm2 start process.json`
6. Surveillez le processus avec PM2 `pm2 monit` ou `pm2 list`