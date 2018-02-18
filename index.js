const cron = require('cron');
const express = require('express');
const fs = require('fs');
const mail = require('nodemailer');
const moment = require('moment');
const { promisify } = require('util');
const shell = require('shelljs');
const twilio = require('twilio');

const app = express();
const cronSnapInterval = '00 */30 * * * *';
const cronDaily = '59 59 23 * * *';
const port = 3000;

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
  .catch(() => {
    return mkdir(dir);
  });
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
  const snapCmd = `raspistill -vf -hf -o ${snapFile}`;
  return shell.exec(snapCmd, (code, stdout, stderr) => {
    if (code !== 0) {
      return reject(new Error(stderr));
    }
    return resolve(snapFile);
  });
});

// CRONJOBS
const createDateDirCron = new cron.CronJob(cronDaily, createDateDir);
createDateDirCron.start();
const snapCron = new cron.CronJob(cronSnapInterval, snap);
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

app.listen(port, () => {
  console.log(`Listening on ${port}`);
});
