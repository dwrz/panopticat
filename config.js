const crypto = require('crypto');
module.exports = () => {
  const config = {
    port: 3000,
    secret: crypto.randomBytes(24).toString('hex'),
    snapInterval: '00 */30 * * * *',
  };
  return config;
};
