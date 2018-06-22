const prettyPathFormatter = require('./pretty-path-formatter');
const logger = require('./logger');

const { 
  loadConfig, 
  createConfig, 
  setConfig, 
  getConfig } = require('./config');

const {
  createFSWatcher,
  onWatcherReady,
  onFileChange } = require('./files');

const { 
  createTrie,
  putIfNotExists,
  deleteIfExists } = require('./trie');

const { 
  createHyperFeed, 
  restoreFromHypercore,
  getFeedKey,
  onFeedChange,
  feedAppend,
  feedWritable,
  onHypercoreReady,
  createSwarmDiscovery } = require('./feed');

/***********************************************************************/

function App() {
  // defines the "private" attributes
  const internal = {
    watcher: null,
    feed: null,
    swarm: null,
    trie: null,
    rootDir: null,
    remoteDir: []
  }

  return {
    /**
     * This function should be called before all.
     */
    init: function(where, readyListener) {
      const dir = where;
      internal.rootDir = dir.split('/').pop();

      createTrie(where);
      createHyperFeed(where);
      createFSWatcher(where);

      onHypercoreReady(() => {
        onWatcherReady(() => {
          createSwarmDiscovery();
          createConfig(where, {
            feedKey: getFeedKey()
          });
          readyListener();
        });
      });
    },

    /**
     * 
     */
    restore: function(where, from, listener) {

      const dir = where;
      internal.rootDir = dir.split('/').pop();

      createHyperFeed(where, from);
      onHypercoreReady(() => {
        restoreFromHypercore(() => {
          createTrie(where);
          createFSWatcher(where);
          onWatcherReady(() => {
            createSwarmDiscovery();
            createConfig(where, {
              feedKey: getFeedKey()
            });
            logger.info('FEED WRITABLE', `${feedWritable(true)}`);
            listener();
          });
        });
      });
    },

    /**
     * 
     */
    start: function() {
      // handle changes in file system
      onFileChange(data => {
        if (data.operation == 'add' || data.operation == 'change') {
          putIfNotExists(data.path, () => {
            feedAppend(JSON.stringify(data));
          }, () => {
            logger.error('Error', 'Error adding data into trie');
          });
        } 
        else if (data.operation == 'remove') {
          deleteIfExists(
            prettyPathFormatter(internal.rootDir, data.path), 
            () => {
              feedAppend(JSON.stringify(data));
            });
        }
      });

      // handle changes in feed
      onFeedChange(data => {
        const object = JSON.parse(data);
        logger.info(object.operation, 
          prettyPathFormatter(internal.rootDir, object.path));
      });
    },
    stop: function() {

    },
    quit: function() {

    },
    key: function() {
      return getFeedKey();
    }
  }
}

module.exports = App;