const hypercore = require('hypercore');
const hyperdiscovery = require('hyperdiscovery');
const logger = require('./logger');
const package = require('./package');

let feed, swarm;

/**
 * Creates a swarm that can discover another peers
 */
function createSwarmDiscovery() {
  swarm = hyperdiscovery(feed);
  swarm.on('connection', (peer, info) => {
    logger.info('SWARM', 'New peer connection')
    peer.on('close', () => logger.warning('SWARM', 'Peer disconnected') );
  });
}

/**
 * Create a new hypercore feed or restore from a givin key
 * @param {string} path 
 * @param {string} key 
 */
function createHyperFeed(path, key) {
  if (key) {
    feed = hypercore(`${path}/.feed.db`, key);
  } else {
    feed = hypercore(`${path}/.feed.db`);
  }
}

function restoreFromHypercore(listener) {
  const length = feed.length;
  const queryPackage = package('request', {
    operation: 'lastState'
  });
  feed.append()
  listener(length);
}

/**
 * Listen to events on feed
 * @param {Function} listener 
 * @param {Function} errorListener 
 */
function onFeedChange(listener, errorListener) {
  feed.on('append', () => {
    feed.head((e, data) => {
      if (e) errorListener(e);
      else listener(data);
    });
  });
}

/**
 * Append data into feed
 * @param {string} data 
 * @param {Function} listener 
 */
function feedAppend(data, listener) {
  feed.append(data, listener);
}

/**
 * Return the state of writable config of feed
 * @param {boolean} flag 
 * @returns {boolean} is writable
 */
function feedWritable(flag) {
  if (typeof flag == 'boolean') {
    feed.writable = flag;
  }
  return feed.writable;
}

/**
 * Listen to ready event. Triggers the listener when ready
 * @param {Function} listener 
 */
function onHypercoreReady(listener) {
  feed.on('ready', listener);
}

/**
 * Return the feed key if feed is ready
 * @returns {string} key that identify this feed
 */
function getFeedKey() {
  return feed.key.toString('hex');
}

module.exports = { 
  createHyperFeed, 
  restoreFromHypercore,
  getFeedKey,
  onFeedChange,
  feedAppend,
  feedWritable,
  onHypercoreReady,
  createSwarmDiscovery 
}