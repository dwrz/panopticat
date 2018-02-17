const cron = require('cron');
const express = require('express');
const fs = require('fs');
const mail = require('nodemailer');
const shell = require('shelljs');
const twilio = require('twilio');

const app = express();
const PORT = 3000;

// SETUP

// CAMERA
const snap = () => {
  console.log('SNAP');
  shell.exec('raspistill -vf -hf -o panopticat-$(date +%Y%m%d-%H%M%S).jpg', (code, stdout, stderr) => {
    console.log(code);
    console.log(stdout);
    console.log(stderr);
  });
};

// CRONJOBS
const snapEvery30Min = new cron.CronJob('* */30 * * * *', snap);
snapEvery30Min.start();

// SERVER
app.get('/', (req, res) => {
  res.end('OK');
});

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
