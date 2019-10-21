const path = require('path');
const {InputError, AuthError, NotFoundError} = require(path.join(process.cwd(), 'lib', 'errors'));
const config = require(path.join(process.cwd(), 'lib', 'config'));
const logger = require(path.join(process.cwd(), 'lib', 'logger'))(config.logging);
//const database = require(path.join(process.cwd(), 'lib', 'database'))(config.database);
/**
 * Policies can be applied to routes through config/policies.js
 * Policies are executed prior to a route being executed.
 *
 * If a policy is successful, you must call `next()` to move onto
 * the matching route.
 *
 * If the policy fails, you must return any `res.handler` to terminate
 * execution.
 */
module.exports = {
  /**
   * Is authenticated
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   * @return {Any}
   */
  isAuthenticated: function(req, res, next) {
    let isAuth = false;

    try {
      isAuth = req.session.authenticated;
    } catch (err) {
      // Nothing
    }

    if (!isAuth) {
      const url = req.url;
      return res.redirect('/?r=' + encodeURIComponent(url));
    } else {
      return next();
    }
  }
};
