/**
 * Custom application logger
 */
const winston = require('winston');
const extend = require('extend');
const path = require('path');
const _module = this;

/**
 * Initialize logger object
 * @param {Object} [options]
 * @return {Object} Logger instance
 */
const Logger = function(options = {}) {
  if (_module._instance) {
    return _module._instance;
  }

  const defaults = {
    level: 'info',
    filename: path.join(process.cwd(), 'output.log')
  };

  options = extend(true, defaults, options);

  _module._instance = winston.createLogger({
    level: options.level,
    format: winston.format.combine(
      winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
      winston.format.printf(info => `${info.timestamp} ${info.level.toUpperCase()}: ${info.message}`)
    ),
    transports: [
      new winston.transports.Console({
        level: options.level,
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(
            info => `${info.timestamp} ${info.level}: ${info.message}`
          )
        )
      }),
      new winston.transports.File({
        level: options.level,
        timestamp: true,
        filename: options.filename,
        handleExceptions: true,
        json: false,
        maxsize: 5242880,
        maxFiles: 5,
        colorize: false
      })
    ]
  });

  _module._instance.stream = {
    write: function(message, encoding){
      _module._instance.info(message.trim());
    }
  }

  return _module._instance
};

module.exports = Logger;