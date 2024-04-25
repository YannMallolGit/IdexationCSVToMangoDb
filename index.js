
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

// mongoose.connect('mongodb://localhost:27017/sirene');
mongoose.connect('mongodb+srv://yannmallolpro:1234@cluster0.j4o0v1g.mongodb.net/sirene').then(async () => {
    console.log('Connecté à MongoDB Atlas');
  }).catch((err) => {
    console.error('Erreur de connexion à MongoDB Atlas:', err);
  });

process.on('message', (message) => {
  console.log('Message reçu du processus parent:', message);
  
  if (message.type === 'process:msg' && message.data && message.data.message != "stop") {
    console.log('Contenu du message:', message.data);
    
    const csvDirectory = './output';
    //const csvDirectory = './outputTest';
    const filePath = path.join(csvDirectory, message.data.message);
    const etablissements = []
    new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
      .pipe(csv()) 
      .on('data', (lineObject) => {
        
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
        console.log("reading")
        
        
      }).on('end', () => {
        resolve(); // Indique que la lecture du CSV est terminée
      }).on('error', (err) => {
        reject(err);
      });
    }).then(async () => {
      await Etablissement.insertMany(etablissements);
      sendReadyForNextMessage()
      console.log('Insertion réussie des données.');
    }).catch((err) => {
      console.error('Erreur lors de l\'insertion des données:', err);
    });
  }
});

//workder ready
sendReadyForNextMessage()
