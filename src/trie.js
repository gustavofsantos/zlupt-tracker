const hypertrie = require('hypertrie');
const prettyPathFormatter = require('./pretty-path-formatter');
const { generateSignature } = require('./files');

let trie, rootDir;

/**
 * Create the internal data structure that store all signatures of files
 * @param {string} root root directory to folder sync
 */
function createTrie(root) {
  trie = hypertrie(`${root}/.trie.db`);
  rootDir = root.split('/').pop();
}

/**
 * Restore the internal data structure from another trie
 * @param {string} root directory to folder sync
 * @param {string} key hash key to load trie
 */
function restoreTrie(root, key) {
  trie = hypertrie(`${root}/.trie.db`, key);
  rootDir = root.split('/').pop();
}

/**
 * Put a value into the trie if the key doesn't exist yet
 * @param {string} path 
 * @param {Function} listener 
 * @param {Function} errorListener 
 */
function putIfNotExists(path, listener, errorListener) {
  trie.get(
    prettyPathFormatter(rootDir, path),
    res => {
      if (!res) {
        // insert the file if the path isn't in trie
        trie.put(
          prettyPathFormatter(rootDir, path),
          generateSignature(path),
          listener);
      } else {
        errorListener();
      }
    }
  )
}

/**
 * Delete a entry from trie if exists
 * @param {string} path 
 * @param {Function} listener 
 */
function deleteIfExists(path, listener) {
  trie.del(path, listener);
}

module.exports = {
  createTrie,
  restoreTrie,
  putIfNotExists,
  deleteIfExists
}