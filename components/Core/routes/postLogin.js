const path = require('path');
const {InputError, AuthError, NotFoundError} = require(path.join(process.cwd(), 'lib', 'errors'));
const config = require(path.join(process.cwd(), 'lib', 'config'));
const logger = require(path.join(process.cwd(), 'lib', 'logger'))(config.logging);
const database = require(path.join(process.cwd(), 'lib', 'database'))(config.database);
const security = require(path.join(process.cwd(), 'lib', 'security'));
/**
 * get index
 * `this` is a reference to the Component
 */
module.exports.postLogin = {
  method: 'POST',
  path: '/auth/login',

  /**
  * Attempt login
  * @param {Objec} req
  * @param {Object} res
  */
  handler: function(req, res) {
    const self = this;
    if (req.body.email && req.body.password) {
      const email = req.body.email.toLowerCase();
      const pass = req.body.password;

      // Retrieve user information from database
      database.getConnection().then(connection => {
        return connection.select()
            .from('users')
            .where(connection.raw('LOWER(`email`) = ?', email))
            .limit(1)
            .then(users => {
              if (users.length === 0) {
                res.render(self.view('login'), {message: 'User not found'});
              } else {
                // Validated incoming password matches stored hashed password
                const user = users[0];
                security.matches(pass, user.password).then(valid => {
                  if (valid) {
                    req.session.authenticated = true;
                    req.session.wxuser = user;
                    req.session.save(() => {
                      const url = req.body.r || '/';
                      res.redirect(url);
                    });
                  } else {
                    res.render(self.view('login'), {message: 'Invalid password supplied', email: email});
                  }
                }).catch(err => {
                  res.render(self.view('login'), {message: err.toString()});
                });
              }
            });
      }).catch(err => {
        res.serverError(err.toString());
      });
    } else {
      res.render(self.view('login'), {message: 'Missing e-mail or password'});
    }
  }
};
