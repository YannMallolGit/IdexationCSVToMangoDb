const pm2 = require('pm2')
const fs = require('fs');
const path = require('path');

const csvDirectory = './output';
//const csvDirectory = './outputTest';
const files = fs.readdirSync(csvDirectory).filter((file) => file.endsWith('.csv'));
const workerArrayStopped = []
let nbWorkers = 0;
const startTime = new Date();

function workderStoped(id_worker){
  workerArrayStopped.push(id_worker);
  if(nbWorkers == workerArrayStopped.length){
    const endTime = new Date();
    const timeTaken = (endTime - startTime) / 1000;
    console.log(`Temps d'indexation : ${timeTaken} secondes`);
    pm2.disconnect();
    process.exit();
  }
}
pm2.connect(function() {

  pm2.start('process.json', (err, apps) => {
    if (err) {
      console.error('Erreur lors du démarrage des workers:', err);
    } else {
      console.log('Workers démarrés avec succès.');
    }
    pm2.list((err, processDescriptionList) => {
      if (err) {
        console.error('Erreur lors de la récupération de la liste des processus:', err);
        return;
      }
      const targetProcesses = processDescriptionList.filter(proc => proc.name === 'indexation-worker');
      nbWorkers = targetProcesses.length;
      /**
      targetProcesses.forEach(proc => {
        pm2.sendDataToProcessId({
          id: proc.pm_id,
          type: 'process:msg',
          data: {
            message: files.length ? files.pop(): "stop"
          },
          topic: 'Envoie nom fichier'
        }, (err, res) => {
          if (err) {
            console.error('Erreur lors de l\'envoi du message au processus:', err);
          } else {
            console.log('Message envoyé:', res);
          }
        });
      }); */
  
    });
    
    pm2.launchBus((err, pm2_bus) => {
      if (err) {
        console.error('Erreur lors du lancement du bus:', err);
        return;
      }
  
      pm2_bus.on('reponse:msg', packet => {
        console.log('Message reçu du processus:', packet);
        if(files.length == 0){
          workderStoped(packet.process.pm_id);
        }
        pm2.sendDataToProcessId({
          id: packet.process.pm_id,
          type: 'process:msg',
          data: {
            message: files.length ? files.pop(): "stop"
          },
          topic: 'Envoie nom fichier'
        }, (err, res) => {
          if (err) {
            console.error('Erreur lors de l\'envoi du message au processus:', err);
          } else {
            console.log('Message envoyé:', res);
          }
        });
      });
    });
  });
})




/**
 * 
 * 
 * 
const pm2 = require('pm2');
const readline = require('readline');

// Interface de lecture pour écouter les commandes de la console
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

// Connexion à PM2
pm2.connect((err) => {
  if (err) {
    console.error('Impossible de se connecter à PM2:', err);
    process.exit(2);
  }

  console.log('PM2 connecté. Commandes disponibles :');
  console.log('"start" pour démarrer les workers');
  console.log('"stop" pour arrêter les workers');
  console.log('"status" pour afficher le statut des workers');

  // Démarrer ou contrôler les workers en fonction de l'entrée utilisateur
  rl.on('line', (input) => {
    switch (input.trim()) {
      case 'start':
        pm2.start('process.json', (err, apps) => {
          if (err) {
            console.error('Erreur lors du démarrage des workers:', err);
          } else {
            console.log('Workers démarrés avec succès.');
          }
        });
        break;

      case 'stop':
        pm2.stop('indexation-worker', (err) => {
          if (err) {
            console.error('Erreur lors de l\'arrêt des workers:', err);
          } else {
            console.log('Workers arrêtés.');
          }
        });
        break;

      case 'status':
        pm2.list((err, processDescriptionList) => {
          if (err) {
            console.error('Erreur lors de l\'obtention du statut des workers:', err);
          } else {
            console.log('Statut des workers:', processDescriptionList);
          }
        });
        break;

      default:
        console.log('Commande non reconnue. Utilisez "start", "stop", ou "status".');
	  pm2.sendDataToProcessId({
			// id of process from "pm2 list" command or from pm2.list(errback) method
			id   : 1,

			// process:msg will be send as 'message' on target process
			type : 'process:msg',

			// Data to be sent
			data : {
			  some : 'data'
			}
		  }, function(err, res) {
		  })
		
		pm2.launchBus(function(err, pm2_bus) {
  pm2_bus.on('process:msg', function(packet) {
    console.log(packet)
  })
})
		
    }
  });

 */