const crypto = require('crypto');
const fs = require('fs');
const readFile = (file) => {
  try {
    return fs.readFileSync(file);
  } catch (e) {
    return null;
  }
};
module.exports = () => {
  const config = {
    port: 3000,
    secret: crypto.randomBytes(24).toString('hex'),
    snapInterval: '00 */30 * * * *',
  };
  return config;
};
