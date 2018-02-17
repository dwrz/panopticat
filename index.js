const cron = require('cron');
const express = require('express');
const fs = require('fs');
const mail = require('nodemailer');
const moment = require('moment');
const shell = require('shelljs');
const twilio = require('twilio');

const app = express();
const PORT = 3000;

// SETUP

// CAMERA
const snap = () => new Promise((resolve, reject) => {
  console.log('SNAP');
  const date = moment().format('YYYY-MM-DD-HHmmss');
  console.log(date);
  return shell.exec(`touch panopticat-${date}.test`, (code, stdout, stderr) => {
    console.log(code);
    console.log(stdout);
    console.log(stderr);
    if (code !== 0) {
      reject(new Error(stderr));
    }
    resolve(`panopticat-${date}.test`);
  });
  // shell.exec('raspistill -vf -hf -o panopticat-$(date +%Y%m%d-%H%M%S).jpg', (code, stdout, stderr) => {
  //   console.log(code);
  //   console.log(stdout);
  //   console.log(stderr);
  // });
});

// CRONJOBS
const snapEvery30Min = new cron.CronJob('00 */30 * * * *', snap);
snapEvery30Min.start();

// SERVER
app.get('/', (req, res) => {
  res.end('OK');
});

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
