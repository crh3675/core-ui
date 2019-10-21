/* eslint-disable no-console */
/**
 * Core UI
 *
 * @description
 * Web server for delivery of data to Weather Desk
 *
 * @author Craig Hoover
 * @license MIT
 */
const rc = require('rc');
const fs = require('fs-extra');
const path = require('path');
const async = require('async');
const extend = require('extend');
// eslint-disable-next-line no-unused-vars
const colors = require('colors');
const package = require('./package.json');
const cluster = require('cluster');
const rcfilename = `.${package.name}rc`;
const inputs = rc('${package.name}', {
  components: fs.readdirSync('components'),
  cluster: false,
  port: null
});

// Set local public path
const public = 'public';

// Allow components via command line --components
let components = inputs.components;
if (!Array.isArray(inputs.components)) {
  components = components.split(/\W/);
}

// Validate local rc file for application
try {
  fs.statSync(rcfilename);
} catch (err) {
  console.error(`You must run this application using ${'npm start'.green} or run ` +
    `${'node prestart'.green} in order to build the ${rcfilename.blue} file`);
  process.exit(1);
}

// Configure and start cluster if enabled
if (inputs.cluster === 'true' && cluster.isMaster) {
  const config = require('./lib/config');
  const assets = require('./lib/assets');
  const logger = require('./lib/logger')(config.logger);
  const numWorkers = require('os').cpus().length;
  logger.info(`Setting up ${numWorkers} workers`);

  logger.info(`Copying all component assets to ${public.green}`);
  assets.sync(components, public);

  logger.info(`Running asset concatenation`);
  assets.concat(config.assets);

  for (let i = 0; i < numWorkers; i++) {
    logger.debug(`Starting worker ${i}`);
    cluster.fork();
  }

  cluster.on('online', function(worker) {
    logger.info(`Worker ${worker.process.pid} is online`);
  });

  cluster.on('exit', function(worker, code, signal) {
    logger.error(`Worker ${worker.process.pid} died with code: ${code}, and signal: ${signal}`);
    logger.error(`Starting a new worker`);
    cluster.fork();
  });
} else {
  let worker= '';
  const config = require('./lib/config');
  const logging = extend(true, config.logging);

  // Append worker.id to logfile if in cluster mode
  if (inputs.cluster === 'true') {
    const basename = path.basename(logging.filename);
    logging.filename = logging.filename.replace(basename, `${basename}_${cluster.worker.id}`);
    worker = ` for worker ${cluster.worker.id} `;
  }

  // Third-party modules
  const body = require('body-parser');
  const compression = require('compression');
  const cookies = require('cookie-parser');
  const express = require('express');
  const layouts = require('express-ejs-layouts');
  const morgan = require('morgan');
  const Redis = require('ioredis');
  const session = require('express-session');
  const Store = require('connect-redis')(session);
  const useragent = require('express-useragent');

  // Our modules
  const assets = require('./lib/assets');
  const database = require('./lib/database')(config.database);
  const logger = require('./lib/logger')(logging);
  const version = require('./lib/versioning').getVersion();

  // Our middleware
  const cors = require('./middleware/cors')(config.cors);
  const policies = require('./middleware/policies');
  const responses = require('./middleware/responses');

  logger.info(`Using ${rcfilename.blue} configuration to override your programmed settings${worker}`);

  // Influence the number of threads that will be available in the thread pool
  process.env.UV_THREADPOOL_SIZE = Math.ceil(Math.max(4, require('os').cpus().length * 1.5));

  process.on('uncaughtException', function(err) {
    logger.error(err.toString());
    process.exit(1);
  });

  // Main web server application
  const app = express();

  // Disable some features
  app.disable('x-powered-by');

  // Configure web logging
  app.use(morgan('combined', {
    stream: logger.stream
  }));

  // Setup session handling
  app.use(session({
    cookie: config.session.cookie,
    name: config.session.cookie.name,
    secret: 'you-should-change-this',
    store: new Store({client: new Redis(config.session.redis)}),
    saveUninitialized: false,
    resave: false
  }));

  // Setup remoteAddress getter
  app.use((req, res, next) => {
    req.remoteAddress = (req.headers['x-forwarded-for']
     || req.connection.remoteAddress || req.socket.remoteAddress).replace('::ffff:', '');
    next();
  });

  // Web server
  app.enable('trust proxy');
  app.use(cookies());
  app.use(cors);
  app.use(useragent.express());
  app.use(compression());
  app.use(express.static(public));
  app.use(body.json());
  app.use(body.urlencoded({extended: true}));
  app.use(layouts);
  app.use(responses);

  // View rendering options
  app.engine('ejs', require('ejs-locals'));
  app.set('view engine', 'ejs');
  app.set('layout', 'layouts/default');
  app.set('layout extractScripts', true);
  app.set('layout extractStyles', true);

  // Inject variables into our requests
  app.use(function(req, res, next) {
    req.worker = (inputs.cluster === 'true' ? cluster.worker.id : 0);
    res.locals.version = req.version = version;
    next();
  });

  // eslint-disable-next-line new-cap
  const router = express.Router();

  // Inject routes rom components
  components.forEach(name => {
    const Component = require(path.join(process.cwd(), 'components', name));
    const instance = new Component();
    const routes = instance.routes;

    for (const action in routes) {
      /**
       * Bind the found route
       * @example:
       * router.get('/blah'. function(req, res){}))
       */
      const route = routes[action];
      const verb = route.method.toLowerCase();
      const main = route.handler;

      // Get matching policies
      const inline = Object.keys(config.policies).filter(policy => {
        const reg = new RegExp(policy.replace(/\./g, '\\.').replace(/\*/g, '.*'));
        return `${name}.${action}`.match(reg);
      }).map(policy => {
        const entries = config.policies[policy];
        const calls = [];
        entries.forEach(entry => {
          if (!policies.hasOwnProperty(entry)) {
            logger.warn(`Skipping non-existent policy ${entry.yellow}${worker}`);
          } else {
            logger.debug(`Attaching policy ${entry.green} to ${name.bold}.${action.bold}${worker}`);
            calls.push(policies[entry]);
          }
        });
        return calls;
      }).reduce((prev, curr) => {
        return prev.concat(curr);
      }, []);

      // Wrap handler to inject policies
      const handler = function(req, res, next) {
        const preroutes = inline.map(policy => (done) => {
          policy.call(instance, req, res, done);
        });
        async.series(preroutes, () => {
          main.call(instance, req, res, next);
        });
      };
      logger.debug(`Binding route ${route.path.cyan} to ${name.bold}.${action.bold}${worker}`);
      router[verb](route.path, handler);
    }
  });

  // Add in the router
  app.use(router);
  app.use(function(req, res, next) {
    res.status(404).render('404', {layout: 'layouts/error'});
  });

  // Sync assets if not cluster mode
  if (inputs.cluster !== 'true') {
    logger.info(`Copying all component assets to ${public.green}`);
    assets.sync(components, public);

    logger.info(`Running asset concatenation`);
    assets.concat(config.assets);
  }

  const port = inputs.port || config.server.port;
  const server = app.listen(port, (err) => {
    logger.info(`Server listening on port ${port}, v${version}`);
  });

  // Optimizer connections and set socket timeout
  server.on('connection', socket => {
    // Disable Nagles's algorithm for highly interactive apps
    socket.setNoDelay(true);

    // Configure timeout for connections
    socket.setTimeout(config.server.socketTimeout);
  });

  /**
   * Clears update interval, closes connections upon process end
   */
  const shutdownHandler = function() {
    // Clear database connections
    logger.debug('Application going down');
    logger.info(`
                             888 888
                             888 888
                             888 888
 .d88b.  .d88b.  .d88b. .d888888 8888b. 888   888 .d88b.
d88P"88bd88""88bd88""88bd88" 888 888 "88b888  888d8P  Y8b
888  888888  888888  888888  888 888  888888  88888888888
Y88b 888Y88..88PY88..88PY88b 888 888 d88PY88b 888Y8b.
 "Y88888 "Y88P"  "Y88P"  "Y88888 88888P"  "Y88888 "Y8888
     888                                     888
Y8b d88P                                Y8b d88P
 "Y88P"                                  "Y88P"`);

    database.getConnection()
        .then(connection => connection.destroy())
        .then(() => {
          logger.debug('Clearing database connections');
          process.exit(0);
        });
  };

  process.on('SIGTERM', shutdownHandler);
  process.on('SIGINT', shutdownHandler);
}
