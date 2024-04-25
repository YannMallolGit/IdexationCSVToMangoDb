const pm2 = require('pm2')
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const csvDirectory = './output';
//const csvDirectory = './outputTest';
const files = fs.readdirSync(csvDirectory).filter((file) => file.endsWith('.csv'));
const workerArrayStopped = []
let nbWorkers = 0;
const startTime = new Date();

function workerStoped(id_worker){
  workerArrayStopped.push(id_worker);
  if(nbWorkers == workerArrayStopped.length){
    const endTime = new Date();
    const timeTaken = (endTime - startTime) / 1000;
    console.log(`Temps d'indexation : ${timeTaken} secondes`);
    pm2.disconnect();
    process.exit();
  }
}

function startPm2(){
  const startTime = new Date();
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
        // console.log('Message reçu du processus:', packet);
        if(files.length == 0){
          workerStoped(packet.process.pm_id);
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
           // console.log('Message envoyé:', res);
          }
        });
      });
    });
  });

}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

function sendToWorkers(message){
    pm2.list((err, processDescriptionList) => {
        if (err) {
          console.error('Erreur lors de la récupération de la liste des processus:', err);
          return;
        }
        const targetProcesses = processDescriptionList.filter(proc => proc.name === 'indexation-worker');
        targetProcesses.forEach(proc => {
          pm2.sendDataToProcessId({
            id: proc.pm_id,
            type: 'process:actionPause',
            data: {
              message: message
            },
            topic: 'Envoie action pause'
          }, (err, res) => {
            if (err) {
              console.error('Erreur lors de l\'envoi du message au processus:', err);
            } else {
             console.log('Message envoyé:', res);
            }
          });
        }); 
      });
}
pm2.connect(function() {

  stateWorker = ""

  console.log('PM2 connecté. Commandes disponibles :');
  console.log('"start" pour démarrer ou resume les workers');
  console.log('"p" pour mettre en pause les workers');


  // Démarrer ou contrôler les workers en fonction de l'entrée utilisateur
  rl.on('line', (input) => {
    switch (input.trim()) {
      case 'start':
        if(stateWorker == ""){
            //premier lancement
            stateWorker  = "started"
            startPm2();
        }else if(stateWorker =="pause"){
            stateWorker  = "started"
            sendToWorkers("restart")
            // on redemare
        }else{
            console.log("les workers sont déja démarrés")
        }
        // ON envoie un message en disant stop
        break;
      case 'p':
        if(stateWorker == "started"){
          // ON envoie un message en disant stop
          stateWorker  = "pause"
          sendToWorkers("pause")
        }else{
          console.log("les workers ne sont pas démarrés")
        }
        
        break;
      default:
        console.log('Commande non reconnue. Utilisez "start", "pause".');
    }
  });
})