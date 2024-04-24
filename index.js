const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const startTime = new Date();

const EtablissementSchema = new mongoose.Schema({
  siren: String,
  nic: String,
  siret: String,
  dateCreationEtablissement: Date,
  dateDernierTraitementEtablissement: Date,
  typeVoieEtablissement: String,
  libelleVoieEtablissement: String,
  codePostalEtablissement: String,
  libelleCommuneEtablissement: String,
  codeCommuneEtablissement: String,
  dateDebut: Date,
  etatAdministratifEtablissement: String
});

const Etablissement = mongoose.model('Etablissement', EtablissementSchema);

mongoose.connect('mongodb://localhost:27017/sirene', { useNewUrlParser: true, useUnifiedTopology: true });

const csvDirectory = './output';
const files = fs.readdirSync(csvDirectory).filter((file) => file.endsWith('.csv'));

const workerCount = 4;

const distributionPlan = Array.from({ length: workerCount }, () => []);

files.forEach((file, index) => {
  const workerIndex = index % workerCount;  
  distributionPlan[workerIndex].push(file);
});

const workerIndex = parseInt(process.env.pm_id, 10)

// Obtenir les fichiers attribués à ce worker
const filesToProcess = distributionPlan[workerIndex];

// Traiter les fichiers CSV et les insérer dans MongoDB
filesToProcess.forEach((file) => {
  const filePath = path.join(csvDirectory, file);
let isFirstLine = true;
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', async (data) => {
		 if (isFirstLine) {
            isFirstLine = false;
            continue;
        }
		 const fields = line.split(',');

        if (fields.length < 46) {
            console.log(' Nombre insuffisant');
            continue;
        }
      try {
	   const newData = {
            siren: fields[0],
            nic: fields[1],
            siret: fields[2],
            dateCreationEtablissement: fields[4],
            dateDernierTraitementEtablissement: fields[8],
            typeVoieEtablissement: fields[16],
            libelleVoieEtablissement: fields[17],
            codePostalEtablissement: fields[18],
            libelleCommuneEtablissement: fields[19],
            codeCommuneEtablissement: fields[22],
            dateDebut: fields[44],
            etatAdministratifEtablissement: fields[45],
        };
        await Etablissement.create(newData);
      } catch (err) {
        console.error(`Erreur lors de l'insertion de données depuis ${file}:`, err);
      }
    })
    .on('end', () => {
      console.log(`Fichier traité : ${filePath}`);
    });
});

const endTime = new Date();
const timeTaken = (endTime - startTime) / 1000;
console.log(`Temps d'indexation : ${timeTaken} secondes`);
