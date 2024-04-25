
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const mongoose = require('mongoose');

const EtablissementSchema = new mongoose.Schema({
  "siren": String,
  "nic": String,
  "siret": String,
  "dateCreationEtablissement": Date,
  "dateDernierTraitementEtablissement": Date,
  "typeVoieEtablissement": String,
  "libelleVoieEtablissement": String,
  "codePostalEtablissement": String,
  "libelleCommuneEtablissement": String,
  "codeCommuneEtablissement": String,
  "dateDebut": Date,
  "etatAdministratifEtablissement": String
});

const Etablissement = mongoose.model('Etablissement', EtablissementSchema);

function sendReadyForNextMessage(){
  process.send({
    type: 'reponse:msg',
    data: {
      response: 'received',
    },
  });
};
let isPaused = false

let pausePromiseResolve;
let pausePromise = new Promise((resolve) => {
  pausePromiseResolve = resolve;
});

// mongoose.connect('mongodb://localhost:27017/sirene');
mongoose.connect('mongodb+srv://yannmallolpro:1234@cluster0.j4o0v1g.mongodb.net/sirene').then(async () => {
    console.log('Connecté à MongoDB Atlas');
  }).catch((err) => {
    console.error('Erreur de connexion à MongoDB Atlas:', err);
  });

process.on('message', (message) => {
  console.log('Message reçu du processus parent:', message);
  if(message.type === 'process:actionPause'){
    isPaused = message.data.message == "pause" ? true: false;
    if (!isPaused) {
      pausePromiseResolve(); // Reprendre le traitement
    } else {
      pausePromise = new Promise((resolve) => {
        pausePromiseResolve = resolve; // Redéfinir pour permettre une reprise future
      });
    }
  }else if (message.type === 'process:msg' && message.data && message.data.message != "stop") {
    console.log('Contenu du message:', message.data);
    
    const csvDirectory = './outputTest';
    //const csvDirectory = './outputTest';
    const filePath = path.join(csvDirectory, message.data.message);
    const etablissements = []
    new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
      .pipe(csv()) 
      .on('data', async (lineObject) => {
        
        const etablissement = {
          siren: lineObject.siren,
          nic: lineObject.nic,
          siret: lineObject.siret,
          dateCreationEtablissement: lineObject.dateCreationEtablissement,
          dateDernierTraitementEtablissement: lineObject.dateDernierTraitementEtablissement,
          typeVoieEtablissement: lineObject.typeVoieEtablissement,
          libelleVoieEtablissement: lineObject.libelleVoieEtablissement,
          codePostalEtablissement: lineObject.codePostalEtablissement,
          libelleCommuneEtablissement: lineObject.libelleCommuneEtablissement,
          codeCommuneEtablissement: lineObject.codeCommuneEtablissement,
          dateDebut: lineObject.dateDebut,
          etatAdministratifEtablissement: lineObject.etatAdministratifEtablissement,
        };
        etablissements.push(etablissement);
        
      }).on('end', () => {
        resolve(); // Indique que la lecture du CSV est terminée
      }).on('error', (err) => {
        reject(err);
      });
    }).then(async () => {
      if(isPaused){
        await pausePromise; // Attendre que la pause soit annulée
      }
      await Etablissement.insertMany(etablissements);
      sendReadyForNextMessage()
      console.log('Insertion réussie des données.');
    }).catch((err) => {
      console.error('Erreur lors de l\'insertion des données:', err);
    });
  }
});
sendReadyForNextMessage()