
/**
 * Create asset collections to be concatenated into a
 * single file.  Collections can be named anything that
 * you choose.
 */
module.exports.assets = {
  collections: {
    scripts: {
      // Root path of where assets reside
      root: '/components/Core/assets',
      // Output location relative to application path
      output: '/public/scripts/core.js',
      // Files to concatenate
      files: [
        '/scripts/app.js'
      ]
    },
    styles: {
      root: '/components/Core/assets',
      output: '/public/styles/core.css',
      files: [
        '/styles/app.css'
      ]
    }
  }
};
