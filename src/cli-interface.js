const argv = require('yargs').argv;
const logger = require('./logger');
const App = require('./app');

function main() {
  const app = new App();
  if (argv.path) {
    if (argv.key) {
      app.restore(argv.path, argv.key, () => {
        logger.success('Restore', 'Restore is complete.');
        app.start();
        const key = app.key();
        logger.success('Key', key);
      });
    }
    else {
      app.init(argv.path, () => {
        app.start();
        const key = app.key();
        logger.success('Key', key);
      });
    }
  }
  else {
    logger.error('Startup', 'You should pass a path.')
    logger.longText('How to use', `
  node src/cli-interface.js --path /path/to/directory

  or

  node src/cli-interface.js --path /path/to/directory --key <key to another tracker>
    `);
  }
}

main();