/**
 * Inject AWS SSM parameters into config
 */
const AWS = require('aws-sdk');
const path = require('path');
const fs = require('fs');
const app = require('./package.json');
const colors = require('colors');
const knex = require('knex');
const rcfilepath = path.join(process.cwd(), `.${app.name}rc`);
const knexfile = path.join(process.cwd(), `knexfile.js`);

// Remove previous rc config to prevent from being
// loaded by rc() library when we load the current config
if (fs.existsSync(rcfilepath)) {
  fs.unlinkSync(rcfilepath);
}

// Load the config defaults with local settings
const config = require(path.join(process.cwd(), 'lib', 'config'));
const params = findParams(config);
const values = params.map(param => param.value);

// Initialize AWS
if(process.IS_AWS !== 'true') {
  AWS.config.update(config.aws.creds.default);
}

/**
 * Iterate an object to find values matching ssm
 * @param {Object} obj
 * @param {String} path
 * @return {None}
 */
function findParams(obj, path) {
  let params = [];

  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) continue;
    const item = obj[key];
    let newpath = key;
    if (path) {
      newpath = `${path}.${key}`;
    }
    if (typeof item === 'object') {
      params = params.concat(findParams(item, newpath));
    } else if (String(item).match(/^ssm:/)) {
      params.push({path: newpath, value: item.replace(/^ssm:/, '')});
    }
  }
  return params;
}

/**
 * Write a config file
 * @param {Object} config
 * @param {String} filePath
 */
const writeConfig = function(config, filePath) {
  // Create rc() file which will be auto-loaded in lib/config.js
  // https://github.com/dominictarr/rc
  fs.writeFileSync(filePath, JSON.stringify(config, null, '  '));
  console.log(`Successfully wrote configuration file ${filePath.green}`);
};

/**
 * Run database migrations for latest
 * @param {Object} config
 */
const migrateDatabase = function(config) {
  knex(config).migrate.latest().then(() => {
    process.exit(0);
  }).catch(err => {
    console.error(err);
    process.exit(1);
  })
}

/**
 * Initialize application settings and update database
 * @param {Object} values
 */
const initialize = function() {
  // Main code
  if (values.length) {
    // Get SSM parameters from Amazom
    const ssm = new AWS.SSM();
    ssm.getParameters({
      Names: values,
      WithDecryption: true
    }, (err, data) => {
      if (err) {
        throw new Error(err);
      }

      // Re-map obtained values to config
      params.forEach(param => {
        const ssmparam = data.Parameters.find(ssm => ssm.Name === param.value);

        // Replace config value with SSM value
        if (ssmparam) {
          const setter = new Function('config', 'value', 'config.' + param.path + '=value;');
          setter(config, ssmparam.Value);
        } else {
          console.error(`Failed to find SSM Param for ${param.path.red}`);
          process.exit(1);
        }
      });
      writeConfig(config, rcfilepath);
      migrateDatabase(config.database);
    });
  } else {
    writeConfig(config, rcfilepath);
    migrateDatabase(config.database);
  }
}

initialize();
