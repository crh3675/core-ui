const path = require('path');

module.exports.logging = {
  level: 'debug',
  filename: path.join(process.cwd(), 'output.log')
};
