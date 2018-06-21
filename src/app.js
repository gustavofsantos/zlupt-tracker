const chokidar = require('chokidar');
const hypercore = require('hypercore');
const hypertrie = require('hypertrie');
const hyperdiscovery = require('hyperdiscovery');
const fs = require('fs');

const files = require('./files');
const prettyPathFormatter = require('./pretty-path-formatter');

function App() {
  // defines the "private" attributes
  const internal = {
    watcher: null,
    feed: null,
    swarm: null,
    trie: null,
    rootDir: null
  }

  function loadConfig(path) {
    const configFile = fs.readFileSync(`${path}/.config.json`, { encoding: 'utf-8' });
    return JSON.parse(configFile);
  }

  function createConfig(path, config) {
    console.log(`create config in ${path}/.config.json`);
    fs.writeFileSync(`${path}/.config.json`, JSON.stringify(config), { encoding: 'utf-8' });
  }

  function saveSnapshot(path) {
    const config = {
      feedKey: internal.feed.key.toString('hex'),
      trieKey: internal.trie.key? internal.trie.key.toString('hex') : ''
    }
    createConfig(path, config);
  }

  function createSwarmDiscovery() {
    internal.swarm = hyperdiscovery(internal.feed);
    internal.swarm.on('connection', (peer, info) => {
      console.log('new peer connection');
      peer.on('close', () => console.log('peer disconected'));
    });
  }

  /**
   * Create a new hypercore feed or restore from a givin key
   * @param {string} path 
   * @param {string} key 
   */
  function createHyperFeed(path, key) {
    if (key) {
      internal.feed = hypercore(`${path}/.feed.db`, key);
    } else {
      internal.feed = hypercore(`${path}/.feed.db`);
    }
  }


  function restoreFromHypercore() {
    const length = internal.feed.length;
  }
  
  /**
   * Create the internal data structure that store all signatures of files
   * @param {string} root root directory to folder sync
   */
  function createTrie(root) {
    internal.trie = hypertrie(`${root}/.trie.db`);
  }

  /**
   * Restore the internal data structure from another trie
   * @param {string} root directory to folder sync
   * @param {string} key hash key to load trie
   */
  function restoreTrie(root, key) {
    internal.trie = hypertrie(`${root}/.trie.db`, key);
  }

  /**
   * Put a value into the trie if the key doesn't exist yet
   * @param {string} path 
   */
  function putIfNotExists(path, done, error) {
    internal.trie.get(
      prettyPathFormatter(internal.rootDir, path),
      res => {
        if (!res) {
          // insert the file if the path isn't in trie
          internal.trie.put(
            prettyPathFormatter(internal.rootDir, path),
            files.generateSignature(path),
            done);
        } else {
          error();
        }
      }
    )
  }

  /**
   * Create the watcher that listen for changes inside the directory
   * recursevely
   * @param {string} path full path to the directory
   */
  function createFSWatcher(path) {
    internal.rootDir = path.split('/').pop();
    internal.watcher = chokidar.watch(path, {
      ignored: /(^|[\/\\])\../,
      persistent: true
    });
  }

  /**
   * Fires when watcher is ready 
   * @param {function} listener function that is fired when watcher is ready
   */
  function onWatcherReady(listener) {
    internal.watcher.on('ready', listener);
  }

  /**
   * Fires when some file is added, changed or removed
   * 
   * @param {function} listener 
   */
  function onFileChange(listener) {
    internal.watcher.on('add', path => 
      listener({
        path,
        operation: 'add'
      }));
    internal.watcher.on('change', path => 
      listener({
        path,
        operation: 'change'
      }));
    internal.watcher.on('unlink', path => 
      listener({
        path,
        operation: 'remove'
      }));
    internal.watcher.on('addDir', path => 
      listener({
        path,
        operation: 'addDir'
      }));
  }

  function onFeedChange(listener) {
    internal.feed.on('append', () => {
      internal.feed.head((e, data) => {
        listener(data);
      });
    });
  }

  function onHypercoreReady(listener) {
    internal.feed.on('ready', listener);
  }

  return {
    /**
     * This function should be called before all.
     */
    init: function(where, readyListener) {
      createTrie(where, () => {
        console.log('trie created');
      });
      createHyperFeed(where);
      createFSWatcher(where);
      onHypercoreReady(() => {
        onWatcherReady(() => {
          createSwarmDiscovery();
          saveSnapshot(where);
          readyListener();
        });
      });
    },

    /**
     * 
     */
    restore: function(where, from) {
      createHyperFeed(where, from);
      restoreFromHypercore();
    },

    /**
     * 
     */
    start: function() {
      onFileChange(data => {
        if (data.operation == 'add' || data.operation == 'change') {
          putIfNotExists(data.path, () => {
            console.log('data is added');
            internal.feed.append(JSON.stringify(data));
          }, () => {
            console.log('data not added');
          });
        } 
        else if (data.operation == 'remove') {
          internal.trie.del(
            prettyPathFormatter(internal.rootDir, data.path));
        }
        console.log(data);
      });
      onFeedChange(data => {
        console.log(data.toString());
      });
    },
    stop: function() {

    },
    quit: function() {

    }
  }
}

module.exports = App;