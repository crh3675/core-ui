const crypto = require('crypto');

module.exports = {

  defaultAlgorithm: 'pbkdf2',
  defaultFormat: 'hex',
  defaultPBKDF2Iterations: 10000,
  defaultPBKDF2KeyLength: 512,
  defaultPBKDF2Digest: 'sha512',

  /**
    * Hash the specified plain-text string.
    *
    * @param {String} value The plain-text value to hash.
    * @param {String|null} salt A salt value to increase security.
    * @param {String} algorithm
    * @param {String} format
    * @return {Promise<String>} Hash string.
    */
  hash: function(value, salt=this.generateSalt(), algorithm=this.defaultAlgorithm, format=this.defaultFormat) {
    return new Promise((resolve, reject) => {
      let hash;
      if (algorithm === 'pbkdf2') {
        crypto.pbkdf2(value, salt, this.defaultPBKDF2Iterations, this.defaultPBKDF2KeyLength, this.defaultPBKDF2Digest, (err, key) => {
          if (err) {
            return reject(err);
          }
          hash = key.toString(format);
          resolve(hash +':'+ salt +':'+ algorithm +':'+ format);
        });
      } else {
        hash = crypto.createHmac(algorithm, salt).update(value).digest(format);
        resolve(hash +':'+ salt +':'+ algorithm +':'+ format);
      }
    });
  },

  /**
    * Checks if the specified plain-text value matches
    * the specified hash value.
    *
    * @param {String} plaintext
    * @param {String} hash
    * @return {Promise<Boolean>} Returns true if they match, false is they do not match.
    */
  matches: function(plaintext, hash) {
    // Make sure both the plaintext and hash values are non-empty
    if (plaintext && hash) {
      // Split the hash value into parts
      const {salt, algorithm, format} = this.split(hash);

      if (salt && algorithm && format) {
        return this.hash(plaintext, salt, algorithm, format).then(h => h === hash);
      }
    }

    return Promise.resolve(false);
  },

  /**
   * Splits a hash string into it's parts
   * @param {String} hash
   * @return {Object}
   */
  split: function(hash) {
    const parts = hash.split(':');

    return {
      hash: parts[0],
      salt: parts[1],
      algorithm: parts[2],
      format: parts[3]
    };
  },

  /**
    * Generate a random salt value.
    *
    * @param {Integer} length The length of the generated salt string.
    * @return {String} Password hash
    */
  generateSalt: function(length=20) {
    return crypto.randomBytes(length).toString('hex');
  }
};
