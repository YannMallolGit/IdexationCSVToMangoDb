
  

# Documentation du Processus d'Indexation

  

## Introduction

Cette documentation décrit le processus d'indexation des données à partir d'un fichier CSV dans une base de données MongoDB. L'objectif est de décomposer un fichier CSV volumineux en parties plus petites, puis d'indexer ces parties dans MongoDB pour faciliter les requêtes et l'analyse.

  

## Pré-requis

Avant de commencer, assurez-vous d'avoir les éléments suivants :

- Node.js installé sur votre système.

- Npm installé sur votre système.

- MongoDB opérationnel (local).

- lancer la commande `npm i` une fois le projet récupéré

  

## Structure du Projet

Le projet se compose des éléments suivants :


- Un script JavaScript principal (`entry.js`), c'est le script qui permet de démarrer les workers.

- Un script JavaScript (`index.js`) le script exécuté par les workers.

- Un script `script generate_files.js` permettant de générer dans le dossier Output les fichier .csv

- Un fichier de configuration PM2 (`process.json`) pour paralléliser les tâches et définit le nombre de workers.

- un fichier `package.json` pour gérer les dépendances npm du projet.

- une image `diagrammeDactivitéUML.png` représentant l'UML du processus
- 
- une image `diagrammeTopologie.png` représentant la topologie du processus

- un dossier output vide, qui contiendra l'ensemble des fichiers `sirene-n.csv` une fois le fichier principal décomposé ( Les fichiers CSV source sont créées à partir du `script generate_files.js` et du fichier `StockEtablissement_utf8.csv`)

## Schéma du Processus

Le diagramme UML dans le répertoire montre le flux du processus d'indexation, de la décomposition des fichiers CSV à l'indexation dans MongoDB.

  

## Instructions d'Exécution

1. Ouvrez un terminal

2. Accédez au répertoire où se trouve le script d'indexation.

3. Assurer vous d'avoir une BDD MongoDB opérationnel
4. Assurez vous d'avoir téléchargé le fichier contenant toutes les données, renommé `StockEtablissement_utf8.csv"` et le placer à la racine du projet.
5. Exécuter la commande `npm i`
6. Utilisez le script `generate_files.js` pour diviser le fichier CSV `StockEtablissement_utf8.csv` en parties plus petites, stockées dans dans un dossier`output` déjà existant.
7. Surveillez le processus avec la commande `pm2 link ` sur le site de monitoring

8. Démarrez le gestionnaire de processus en exécutant le fichier js `entry.js`
9. suivre les instructions du script (démarrer / pause le worker)