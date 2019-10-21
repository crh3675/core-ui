const fs = require('fs');
const path = require('path');
const configs = fs.readdirSync(__dirname).filter(file => file.match(/^(?!defaults).*\.js$/));
const defaults = {};

configs.forEach(name => {
  const proxy = require(path.join(__dirname, name));
  Object.keys(proxy).forEach(key => {
    defaults[key] = proxy[key];
  });
});

module.exports = defaults;
