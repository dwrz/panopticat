const cron = require('cron');
const express = require('express');
const fs = require('fs');
const mail = require('nodemailer');
const moment = require('moment');
const shell = require('shelljs');
const twilio = require('twilio');

const app = express();
const cronInterval = '00 */30 * * * *';
const port = 3000;

// SETUP
// TODO: Check that the snaps directory exists.
// TODO: Create a subdirectory for current day, if one does not exist.

// CAMERA
const snap = () => new Promise((resolve, reject) => {
  console.log('SNAP');
  const date = moment().format('YYYYMMDD-HHmmss');
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
const snapCron = new cron.CronJob(cronInterval, snap);
snapCron.start();

// SERVER
app.get('/', (req, res) => {
  res.end('OK');
});

app.get('/snap', (req, res) => {
  snap()
    .then((filename) => {
      res.sendFile(filename, { root: __dirname });
    })
    .catch((err) => {
      res.end(err);
    });
});

app.listen(port, () => {
  console.log(`Listening on ${port}`);
});
