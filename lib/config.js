/* eslint-disable no-console */
/**
 * Configuration loader module.
 * @description
 * Include in files for default configuration
 * @example
 * const config = require(path.join(process.cwd(), 'lib', 'config')); *
 */

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'local';
}

const rc = require('rc');
const path = require('path');
// eslint-disable-next-line no-unused-vars
const colors = require('colors');
const app = require(path.join(process.cwd(),'package.json'));
const extend = require('extend');
const defaults = require(path.join(process.cwd(), 'config'));
const env = path.join(process.cwd(), 'config', 'env', process.env.NODE_ENV);
let local;
let options;

try {
  local = require(env);
  options = extend(true, defaults, local);
} catch (err) {
  if (err.code === 'MODULE_NOT_FOUND') {
    console.error('Configuration Error:'.red);
    console.error(`The Application expected a configuration file at ${(env + '.js').green}`);
    console.error(`The file name is derived from the ${'NODE_ENV'.blue} environmental ` +
      `variable which is currently set to ${process.env.NODE_ENV.blue}.`);
    console.error(`Please configure ${'NODE_ENV'.blue} (i.e. development, production, ` +
      `uat, local) so that it will resolve a file  within the ${'config/env'.green} directory`);
  } else {
    console.error(err.toString());
  }
  process.exit();
}

const config = rc(app.name, options);

module.exports = config;
