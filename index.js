const cron = require('cron');
const express = require('express');
const fs = require('fs');
const mail = require('nodemailer');
const moment = require('moment');
const { promisify } = require('util');
const shell = require('shelljs');
const twilio = require('twilio');

const app = express();
const cronInterval = '00 */30 * * * *';
const port = 3000;

const mkdir = promisify(fs.mkdir);
const stat = promisify(fs.stat);
const checkOrMakeDir = dir => stat(dir)
  .then((stats) => {
    if (stats.isDirectory() === false) {
      return mkdir(dir);
    }
    return true;
  });
const getDateTime = () => moment().format('YYYYMMDD-HHMMss');
const getDate = dateTimeString => dateTimeString.substring(0, 8);
const createDateDir = () => checkOrMakeDir(`./snaps/${getDate(getDateTime())}`);

// SETUP
checkOrMakeDir('snaps')
  .then(() => createDateDir())
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

// CAMERA
const snap = () => new Promise((resolve, reject) => {
  console.log('SNAP');
  const date = moment().format('YYYYMMDD-HHmmss');
  console.log(date);
  return shell.exec(`raspistill -vf -hf -o panopticat-${date}.jpg`, (code, stdout, stderr) => {
    console.log(code);
    console.log(stdout);
    console.log(stderr);
    if (code !== 0) {
      reject(new Error(stderr));
    }
    resolve(`panopticat-${date}.jpg`);
  });
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
