const path = require('path');
const views = path.join(process.cwd(), 'views');

module.exports.layouts = {
  default: path.join(views, 'layouts', 'default.ejs'),
  error: path.join(views, 'layouts', 'error.ejs')
};
