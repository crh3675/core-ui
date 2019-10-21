
//const path = require('path');
//const {InputError, AuthError, NotFoundError} = require(path.join(process.cwd(), 'lib', 'errors'));
//const config = require(path.join(process.cwd(), 'lib', 'config'));
//const logger = require(path.join(process.cwd(), 'lib', 'logger'))(config.logging);
/**
 * get index
 * `this` is a reference to the Component
 */
module.exports.getIndex = {
  method: 'GET',
  path: '/main',

  /**
  * Get main page
  * @param {Objec} req
  * @param {Object} res
  */
  handler: function(req, res) {
    res.render(this.view('index'), {title: 'Main Component'});
  }
};
