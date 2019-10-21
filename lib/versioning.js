const path = require('path');
const fs = require('fs');
const _module = this;
_module.currentVersion = null;

module.exports = {
  /**
   * Return a version from VERSION file
   * @return {String}
   */
  getVersion: function() {
    const filePath = path.join(process.cwd(), 'VERSION');
    if (_module.currentVersion === null) {
      let version = '0.0-r' + Date.now();
      try {
        version = fs.readFileSync(filePath);
      } catch (err) {
        // Noting
      }
      _module.currentVersion = version;
      return _module.currentVersion;
    } else {
      return _module.currentVersion;
    }
  }
};

