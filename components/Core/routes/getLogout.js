const path = require('path');
const {InputError, AuthError, NotFoundError} = require(path.join(process.cwd(), 'lib', 'errors'));
const config = require(path.join(process.cwd(), 'lib', 'config'));
const logger = require(path.join(process.cwd(), 'lib', 'logger'))(config.logging);
/**
 * get logout
 * `this` is a reference to the Component
 */
module.exports.getLogout = {
  method: 'GET',
  path: '/auth/logout',

  /**
  * Get model image
  * @param {Objec} req
  * @param {Object} res
  */
  handler: function(req, res) {
    try {
      delete req.session.wxuser;
      delete req.session.authenticated;
    } catch (err) {
      logger.warn(err.toString());
    }
    req.session.save(() => {
      res.redirect('/');
    });
  }
};
