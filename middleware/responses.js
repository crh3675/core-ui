const path = require('path');
const config = require(path.join(process.cwd(), 'lib', 'config'));

/**
 * Custom reponses
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
module.exports = function(req, res, next) {
  /**
   * HTTP 200 Response
   * @param {String} message
   * @return {Object}
   */
  res.ok = (message) => {
    return res.send(message);
  };
  /**
   * HTTP 400 Response
   * @param {String} message
   * @return {Object}
   */
  res.badRequest = (message) => {
    return res.status(400).render('400', {
      title: 'Bad Request',
      layout: config.layouts.error,
      message: message
    });
  };
  /**
   * HTTP 500 Response
   * @param {String} message
   * @return {Object}
   */
  res.serverError = (message) => {
    return res.status(500).render('500', {
      title: 'Server Error',
      layout: config.layouts.error,
      message: message
    });
  };
  /**
   * HTTP 401 Unauthorized
   * @param {String} message
   * @return {Object}
   */
  res.unauthorized = (message) => {
    return res.status(401).render('401', {
      title: 'Unauthorized',
      layout: config.layouts.error,
      message: message
    });
  };
  /**
   * HTTP 403 Forbidden
   * @param {String} message
   * @return {Object}
   */
  res.forbidden = (message) => {
    return res.status(403).render('403', {
      title: 'Forbidden',
      layout: config.layouts.error,
      message: message
    });
  };
  next();
};
