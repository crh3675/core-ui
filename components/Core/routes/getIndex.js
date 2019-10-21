const path = require('path');
const {InputError, AuthError, NotFoundError} = require(path.join(process.cwd(), 'lib', 'errors'));
const config = require(path.join(process.cwd(), 'lib', 'config'));
const logger = require(path.join(process.cwd(), 'lib', 'logger'))(config.logging);
/**
 * get index
 * `this` is a reference to the Component
 */
module.exports.getIndex = {
  method: 'GET',
  path: '/',

  /**
  * Get root
  * @param {Objec} req
  * @param {Object} res
  */
  handler: function(req, res) {
    let self = this;
    let view = self.view('index');
    if (!req.session.authenticated) {
      view = self.view('login');
    }
    res.render(view, {title: 'Main', req: req});
  }
};
