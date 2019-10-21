const extend = require('extend');

/**
 * Initialize Cors object
 * @param {Object} [options]
 * @return {Function} (req, res) handler
 */
const Cors = function(options = {}) {
  const defaults = {
    expires: 86400 * 24,
    domains: '*',
    methods: 'GET,OPTIONS'
  };

  options = extend(true, defaults, options);

  return function(req, res, next) {
    /**
     * Override CORS upon request as needed
     */
    res.noCors = function() {
      res.set('Access-Control-Max-Age', null);
      res.set('Access-Control-Allow-Origin', null);
      res.set('Access-Control-Allow-Methods', null);
      res.set('Access-Control-Allow-Header', null);
    };

    // Default all requests for cross-origin resource sharing (CORS)
    res.set('Access-Control-Max-Age', options.expires);
    res.set('Access-Control-Allow-Origin', options.domains);
    res.set('Access-Control-Allow-Methods', options.methods);
    res.set('Access-Control-Allow-Headers', 'Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,' +
      'Cache-Control,Content-Type,X-CSRF-Token');

    // Intercept OPTIONS method
    if (req.method == 'OPTIONS') {
      return res.sendStatus(200);
    } else {
      next();
    }
  };
};

module.exports = Cors;
