const sha256 = require('crypto-js/sha256');
const fs = require('fs');
const chokidar = require('chokidar');

let watcher, rootDir;

function generateSignature(filePath) {
  const file = fs.readFileSync(filePath, { encoding: 'utf-8' });
  return sha256(file).toString();
}

function compareSignature(signature, filePath) {
  const fileSig = generateSignature(filePath);
  return signature === fileSig;
}

/**
 * Create the watcher that listen for changes inside the directory
 * recursevely
 * @param {string} path full path to the directory
 */
function createFSWatcher(path) {
  watcher = chokidar.watch(path, {
    ignored: /(^|[\/\\])\../,
    persistent: true
  });
}

/**
 * Fires when watcher is ready 
 * @param {Function} listener function that is fired when watcher is ready
 */
function onWatcherReady(listener) {
  watcher.on('ready', listener);
}

/**
 * Fires when some file is added, changed or removed
 * 
 * @param {Function} listener 
 */
function onFileChange(listener) {
  watcher.on('add', path => 
    listener({
      path,
      operation: 'add'
    }));
  watcher.on('change', path => 
    listener({
      path,
      operation: 'change'
    }));
  watcher.on('unlink', path => 
    listener({
      path,
      operation: 'remove'
    }));
  watcher.on('addDir', path => 
    listener({
      path,
      operation: 'addDir'
    }));
}

module.exports = {
  createFSWatcher,
  onWatcherReady,
  onFileChange,
  generateSignature,
  compareSignature,
}