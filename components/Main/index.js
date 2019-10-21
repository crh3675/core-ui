
const fs = require('fs');
const path = require('path');
const extend = require('extend');
const EventEmitter = require('events');

// Our modules and config
const config = require(path.join(process.cwd(), 'lib', 'config'));
const logger = require(path.join(process.cwd(), 'lib', 'logger'))(config.logging);
const routes = fs.readdirSync(path.join(__dirname, 'routes')).filter(route => route.match(/.js$/));
const services = fs.readdirSync(path.join(__dirname, 'services')).filter(service => service.match(/.js$/));

/**
 * MainComponent
 * @constructor
 * @param {Object} (options)
 */
class Main extends EventEmitter {
  /**
   * Create component
   * @param {Object} options
   */
  constructor(options = {}) {
    super();

    const self = this;
    const defaults = {};

    self.options = extend(true, defaults, options);
    self.routes = {};

    // Add routes
    routes.forEach(name => {
      const proxy = require(path.join(__dirname, 'routes', name));
      Object.keys(proxy).forEach(key => {
        self.routes[key] = proxy[key];
      });
    });

    // Announce as ready
    setImmediate(() => self.emit('ready'));
  }

  /**
   * Get local view file
   * @param {String} file
   * @return {String}
   */
  view(file) {
    return path.join(__dirname, 'views', file);
  }
}

services.forEach(name => {
  const proxy = require(path.join(__dirname, 'services', name));
  Object.keys(proxy).forEach(key => {
    Main.prototype[key] = proxy[key];
  });
});

module.exports = Main;
