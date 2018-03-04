const cron = require('cron');
const express = require('express');
const fs = require('fs');
const https = require('https');
const mail = require('nodemailer');
const moment = require('moment');
const os = require('os');
const { promisify } = require('util');
const shell = require('shelljs');

const config = require('./config.js')();

const app = express();
const cronSnapInterval = config.snapInterval;
const cronDaily = '59 59 23 * * *';
const {
  camera,
  credentials,
  port,
  secret,
  snapInterval,
} = config;

// HELPERS
const mkdir = promisify(fs.mkdir);
const stat = promisify(fs.stat);
const checkOrMakeDir = dir => stat(dir)
  .then((stats) => {
    if (stats.isDirectory() === false) {
      return mkdir(dir);
    }
    return true;
  })
  .catch(() => mkdir(dir));
const getDateTime = () => moment().format('YYYYMMDD-HHmmss');
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
  const snapDate = getDateTime();
  const snapFile = `./snaps/${getDate(snapDate)}/panopticat-${snapDate}.jpg`;
  const snapCmd = () => {
    if (camera.flip === true) {
      return `raspistill -vf -hf -o ${snapFile}`;
    }
    return `raspistill -o ${snapFile}`;
  };
  return shell.exec(snapCmd(), (code, stdout, stderr) => {
    if (code !== 0) {
      return reject(new Error(stderr));
    }
    return resolve(snapFile);
  });
});

// CRONJOBS
const createDateDirCron = new cron.CronJob(cronDaily, createDateDir);
createDateDirCron.start();
const snapCron = new cron.CronJob(snapInterval, snap);
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
      console.error(err);
      res.end('ERROR');
    });
});

if (credentials.cert && credentials.key) {
  const server = https.createServer(credentials, app);
  server.listen(port, () => {
    console.log(`Listening on ${port}`);
  });
} else {
  app.listen(port, () => {
    console.log(`Listening on ${port}`);
  });
}
