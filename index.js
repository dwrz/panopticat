const bodyParser = require('body-parser');
const cron = require('cron');
const crypto = require('crypto');
const express = require('express');
const fileStore = require('session-file-store');
const fs = require('fs');
const helmet = require('helmet');
const https = require('https');
const mail = require('nodemailer');
const moment = require('moment');
const os = require('os');
const { promisify } = require('util');
const session = require('express-session');
const shell = require('shelljs');

const app = express();
const FileStore = fileStore(session);
const config = require('./config.js')();

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
const getIP = () => {
  const nets = os.networkInterfaces();
  return Object.keys(nets).reduce((str, face) => {
    if (face === 'lo') {
      return str;
    }
    let message = str;
    message += `\n${face}:\n`;
    message += `IPv4: ${nets[face][0].address}\n`;
    message += `IPv6: ${nets[face][1].address}\n`;
    return message;
  }, 'PANOPTICAT IP:\n');
};
const logStartup = (mode) => {
  console.log(getIP());
  console.log(`LISTENING ON PORT ${port}.`);
  console.log(`USING ${mode}.`);
  console.log(`SECRET: ${secret}`);
};

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
app.use(helmet());
app.use(session({
  store: new FileStore(),
  resave: false,
  saveUninitialized: false,
  secret: crypto.randomBytes(24).toString('hex'),
}));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const checkLogin = s => s.pw && s.pw === secret;

app.post('/login', (req, res) => {
  const isLoggedIn = checkLogin(req.session);
  if (!isLoggedIn) {
    // Verify login.
    if (req.body.pw === secret) {
      req.session.pw = req.body.pw;
      return res.status(200).send(true);
    }
    return res.status(403).send(false);
  }
  return res.status(200).send(true);
});

app.get('/logout', (req, res) => req.session.destroy(() => res.redirect('/')));

app.get('/snap', (req, res) => {
  if (req.query.secret === secret) {
    return snap()
      .then(filename => res.sendFile(filename, { root: __dirname }))
      .catch((err) => {
        console.error(err);
        return res.end('ERROR');
      });
  }
  return res.status(403).end('FORBIDDEN');
});

if (credentials.cert && credentials.key) {
  const server = https.createServer(credentials, app);
  server.listen(port, () => {
    logStartup('HTTPS');
  });
} else {
  app.listen(port, () => {
    logStartup('HTTP');
  });
}
