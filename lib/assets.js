const fs = require('fs-extra');
const path = require('path');

module.exports = {
  /**
   * Copy component assets to public dir
   * @param {object} components
   * @param {String} destination
   */
  sync: function(components, destination) {
    components.forEach(name => {
      const localDir = path.join(process.cwd(), 'components', name, 'assets');
      const destDir = `${destination}/components/${name.toLowerCase()}`;
      fs.emptyDirSync(destDir);
      fs.copySync(localDir, destDir);
    });
  },

  /**
   * Concatenate assets
   * @param {Object} assets
   */
  concat: function(assets) {
    for (const name in assets.collections) {
      const group = assets.collections[name];
      const root = path.join(process.cwd(), group.root || '');
      const output = path.join(process.cwd(), group.output);
      if (Array.isArray(group.files) && group.hasOwnProperty('output')) {
        const args = group.files.map(file => {
          return path.join(root, file);
        });
        if (args.length) {
          args.push(' > ', output);
          const cmd = `cat ${args.join(' ')}`;
          require('child_process').execSync(cmd, {
            cwd: process.cwd(),
            stdio: [null, null, process.stderr]
          });
        }
      }
    }
  }
};
