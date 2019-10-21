const fs = require('fs-extra');
const rc = require('rc');
const colors = require('colors');
const path = require('path');
const EventEmitter = require('events');
const inputs = rc('component', {
  action: null,
  name: null
});


/**
 * Component
 * @constructor
 * @param {Object} (options)
 */
class Component extends EventEmitter {
  /**
   * Create component instance
   * @param {Object} options
   */
  constructor(options = {}) {
    super();
  }

  /**
   * Delete a component
   * @param {String} name
   */
  remove(name) {
    const base = path.join(process.cwd(), 'components', name);
    fs.removeSync(base);
  }

  /**
   * Create a new component
   * @param {String} name
   */
  create(name) {
    const expr =new RegExp(`{{name}}`, 'g');
    const lexpr =new RegExp(`{{name.lower}}`, 'g');
    const lname = name.toLowerCase();
    let component = this.template('component');
    let view = this.template('view');
    let route = this.template('route');
    let service = this.template('service');

    view = view.replace(expr, name).replace(lexpr, lname);
    route = route.replace(expr, name).replace(lexpr, lname);
    component = component.replace(expr, name).replace(lexpr, lname);
    service = service.replace(expr, name).replace(lexpr, lname);

    const base = path.join(process.cwd(), 'components', name);

    fs.ensureDirSync(base);
    fs.ensureDirSync(path.join(base, 'assets'));
    fs.ensureDirSync(path.join(base, 'routes'));
    fs.ensureDirSync(path.join(base, 'services'));
    fs.ensureDirSync(path.join(base, 'views'));

    fs.writeFileSync(path.join(base, 'index.js'), component, {flag: 'w+'});
    fs.writeFileSync(path.join(base, 'views', 'index.ejs'), view, {flag: 'w+'});
    fs.writeFileSync(path.join(base, 'routes', 'getIndex.js'), route, {flag: 'w+'});
    fs.writeFileSync(path.join(base, 'services', 'getStartup.js'), service, {flag: 'w+'});
    fs.writeFileSync(path.join(base, 'assets', `${name.toLowerCase()}.js`), '', {flag: 'w+'});
    fs.writeFileSync(path.join(base, 'assets', `${name.toLowerCase()}.css`), '', {flag: 'w+'});
  }

  /**
   * Retrieve document text
   * @param {String} which
   * @return {String}
   */
  template(which) {
    const service = `
module.exports.getStartup = function() {
  // Add code here
};
`;
    const component = `
const fs = require('fs');
const path = require('path');
const extend = require('extend');
const EventEmitter = require('events');

// Our modules and config
const config = require(path.join(process.cwd(), 'lib', 'config'));
const logger = require(path.join(process.cwd(), 'lib', 'logger'))(config.logging);
const routes = fs.readdirSync(path.join(__dirname, 'routes')).filter(route => route.match(/\.js$/));
const services = fs.readdirSync(path.join(__dirname, 'services')).filter(service => service.match(/\.js$/));

/**
 * {{name}}Component
 * @constructor
 * @param {Object} (options)
 */
class {{name}} extends EventEmitter {
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
    {{name}}.prototype[key] = proxy[key];
  });
});

module.exports = {{name}};
`;

    const route = `
//const path = require('path');
//const {InputError, AuthError, NotFoundError} = require(path.join(process.cwd(), 'lib', 'errors'));
//const config = require(path.join(process.cwd(), 'lib', 'config'));
//const logger = require(path.join(process.cwd(), 'lib', 'logger'))(config.logging);
/**
 * get index
 * \`this\` is a reference to the Component
 */
module.exports.getIndex = {
  method: 'GET',
  path: '/{{name.lower}}',

  /**
  * Get main page
  * @param {Objec} req
  * @param {Object} res
  */
  handler: function(req, res) {
    res.render(this.view('index'), {title: '{{name}} Component'});
  }
};
`;

    const view = `<%- stylesheet('/components/{{name.lower}}/{{name.lower}}.css') %>
<%- script('/components/{{name.lower}}/{{name.lower}}.js') %>
{{name}}
`;

    switch (which) {
      case 'component':
        return component;
      case 'service':
        return service;
      case 'route':
        return route;
      case 'view':
        return view;
    }
  }
}

if (inputs.action === 'create' && inputs.name) {
  const c = new Component();
  c.create(inputs.name);
}

if (inputs.action === 'remove' && inputs.name) {
  const c = new Component();
  c.remove(inputs.name);
}
if (!inputs.action && !inputs.name) {
  console.log(`${'NAME'.bold}
      Component - Use this script to create or remove components.

${'SYNOPSIS'.bold}
      ${'node'.bold} [options]

${'OPTIONS'.bold}
      ${'--action'.bold}
          Specify action to run, ${'create'.bold} or ${'remove'.bold}

      ${'--name'.bold}
          Name of component to target

${'EXAMPLE'.bold}
      node bin/component.js --action=create --name=My
`);
}

