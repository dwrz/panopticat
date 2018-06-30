const crypto = require('crypto');
const cron = require('cron');
const fs = require('fs');

const readFile = (file) => {
  try {
    return fs.readFileSync(file);
  } catch (e) {
    return null;
  }
};

// openssl genrsa -out localhost.key 2048
// openssl req -new -x509 -key localhost.key -out localhost.cert -days 3650 -subj /CN=localhost
const cert = readFile('./panopticat.cert');
const key = readFile('./panopticat.key');

const setSnapInterval = () => {
  try {
    const job = new cron.CronJob(process.env.PANOPTICAT_INTERVAL, () => {
    });
    job.stop();
    return process.env.PANOPTICAT_INTERVAL;
  } catch (e) {
    console.log('PANOPTICAT INTERVAL NOT VALID. USING DEFAULT (EVERY HALF-HOUR).');
    return '00 */30 * * * *';
  }
};

module.exports = () => {
  const config = {
    credentials: {
      cert,
      key,
    },
    camera: {
      flip: false,
    },
    port: 3000,
    secret: crypto.randomBytes(24).toString('hex'),
    snapInterval: '00 */30 * * * *',
  };
  return config;
};
