const path = require('path');
const extend = require('extend');
const knex = require('knex');
const config = require(path.join(process.cwd(), 'lib', 'config'));
const logger = require(path.join(process.cwd(), 'lib', 'logger'))(config.logging);
const _module = this;

/**
 * Initialize a database object
 * @param {Object} [options]
 * @return {Object} MySql database connection
 */
const Database = function(options = {}) {
  return {
    getConnection: function() {
      return new Promise((resolve, reject) => {
        if (_module._pool) {
          resolve(_module._pool);
        } else {
          const defaults = {
            client: 'mysql2',
            pool: {
              min: 1,
              max: 5
            },
            log: {
              error: logger.error
            }
          };
          options = extend(true, defaults, options);

          logger.debug('Establishing database connection');
          _module._pool = knex(options);
          resolve(_module._pool);
        }
      });
    }
  };
};

module.exports = Database;

