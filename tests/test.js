
const hypercore = require('hypercore');
const hyperdiscovery = require('hyperdiscovery');
const ctrlcExit = require('ctrlc-exit');

const key = '79c92163fdc67e22d06d2c3a5958c51394019211633f661362cdfe61e33e505d';

const feed = hypercore('test', key);
const swarm = hyperdiscovery(feed);
feed.on('ready', () => {
  feed.on('append', () => {
    console.log('feed changed');
    feed.head((e, data) => {
      console.log(data.toString());
    });
  });
});

ctrlcExit();